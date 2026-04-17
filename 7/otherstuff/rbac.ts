// ── Types ────────────────────────────────────────────────────────────────────

type Role = "admin" | "moderator" | "editor" | "user" | "guest";

interface Tenant {
  id: number;
  name: string;
}

interface User {
  id: number;
  tenant: Tenant;
  role: Role;
  name: string;
}

interface Post {
  id: number;
  tenant: Tenant;
  authorId: number;
  title: string;
  published: boolean;
}

interface PermissionContext {
  user: User;
  post?: Post;
  targetUser?: User;
}

type Permission = boolean | ((ctx: PermissionContext) => boolean);

type PostAction   = "read" | "create" | "edit" | "delete" | "publish";
type UserAction   = "view" | "ban" | "unban" | "changeRole" | "remove";
type TenantAction = "viewSettings" | "editSettings" | "inviteUser";

type Asset = "post" | "user" | "tenant";
type Action = PostAction | UserAction | TenantAction;

// ── Tenant guard ─────────────────────────────────────────────────────────────

function tenantScoped(inner: Permission): Permission {
  return (ctx: PermissionContext) => {
    const resourceTenant = ctx.post?.tenant ?? ctx.targetUser?.tenant;
    if (resourceTenant && resourceTenant.id !== ctx.user.tenant.id) return false;

    if (typeof inner === "boolean") return inner;
    return inner(ctx);
  };
}

// ── RBAC definition ──────────────────────────────────────────────────────────
//
//  guest      → read published posts only
//  user       → read all posts, manage own posts
//  editor     → manage any post (no delete); no user/tenant powers
//  moderator  → editor + delete posts + ban/unban users; cannot change roles or tenant settings
//  admin      → full control within the tenant

const rbac: Record<Role, Partial<Record<Asset, Partial<Record<Action, Permission>>>>> = {
  guest: {
    post: {
      read:    tenantScoped(({ post }) => post?.published === true),
      create:  false,
      edit:    false,
      delete:  false,
      publish: false,
    },
  },

  user: {
    post: {
      read:    tenantScoped(true),
      create:  tenantScoped(true),
      edit:    tenantScoped(({ user, post }) => post?.authorId === user.id),
      delete:  tenantScoped(({ user, post }) => post?.authorId === user.id),
      publish: tenantScoped(({ user, post }) => post?.authorId === user.id),
    },
    user: {
      view:       tenantScoped(true),   // can see other users in same tenant
      ban:        false,
      unban:      false,
      changeRole: false,
      remove:     false,
    },
  },

  editor: {
    post: {
      read:    tenantScoped(true),
      create:  tenantScoped(true),
      edit:    tenantScoped(true),      // any post
      delete:  false,                   // editors don't delete
      publish: tenantScoped(true),      // any post
    },
    user: {
      view:       tenantScoped(true),
      ban:        false,
      unban:      false,
      changeRole: false,
      remove:     false,
    },
  },

  moderator: {
    post: {
      read:    tenantScoped(true),
      create:  tenantScoped(true),
      edit:    tenantScoped(true),
      delete:  tenantScoped(true),      // moderators can delete any post
      publish: tenantScoped(true),
    },
    user: {
      view:       tenantScoped(true),
      ban:        tenantScoped(true),   // can ban
      unban:      tenantScoped(true),   // can unban
      changeRole: false,                // cannot promote/demote
      remove:     false,                // cannot remove users from tenant
    },
    tenant: {
      viewSettings:  false,
      editSettings:  false,
      inviteUser:    false,
    },
  },

  admin: {
    post: {
      read:    tenantScoped(true),
      create:  tenantScoped(true),
      edit:    tenantScoped(true),
      delete:  tenantScoped(true),
      publish: tenantScoped(true),
    },
    user: {
      view:       tenantScoped(true),
      ban:        tenantScoped(true),
      unban:      tenantScoped(true),
      changeRole: tenantScoped(true),   // admin can promote/demote
      remove:     tenantScoped(true),   // admin can remove users from tenant
    },
    tenant: {
      viewSettings:  tenantScoped(true),
      editSettings:  tenantScoped(true),
      inviteUser:    tenantScoped(true),
    },
  },
};

// ── Engine ───────────────────────────────────────────────────────────────────

function can(user: User, action: Action, asset: Asset, resource?: Post | User): boolean {
  const permission = rbac[user.role]?.[asset]?.[action];

  if (permission === undefined) return false;
  if (typeof permission === "boolean") return permission;

  const ctx: PermissionContext = {
    user,
    post:       asset === "post" ? resource as Post : undefined,
    targetUser: asset === "user" ? resource as User : undefined,
  };
  return permission(ctx);
}

// ── Demo ─────────────────────────────────────────────────────────────────────

const acme:  Tenant = { id: 1, name: "Acme Blog" };
const other: Tenant = { id: 2, name: "Other Corp" };

const admin:      User = { id: 1, tenant: acme,  role: "admin",     name: "Admin" };
const moderator:  User = { id: 2, tenant: acme,  role: "moderator", name: "Mod" };
const editor:     User = { id: 3, tenant: acme,  role: "editor",    name: "Editor" };
const alice:      User = { id: 4, tenant: acme,  role: "user",      name: "Alice" };
const bob:        User = { id: 5, tenant: acme,  role: "user",      name: "Bob" };
const guest:      User = { id: 6, tenant: acme,  role: "guest",     name: "Guest" };
const otherAdmin: User = { id: 7, tenant: other, role: "admin",     name: "Admin (Other)" };

const alicePost: Post = { id: 101, tenant: acme,  authorId: alice.id, title: "Alice's post", published: true  };
const bobDraft:  Post = { id: 102, tenant: acme,  authorId: bob.id,   title: "Bob's draft",  published: false };
const otherPost: Post = { id: 201, tenant: other, authorId: 99,       title: "Other post",   published: true  };

type PostCheck   = [User, Action, "post",   Post,  string];
type UserCheck   = [User, Action, "user",   User,  string];
type TenantCheck = [User, Action, "tenant", undefined, string];

const checks: Array<PostCheck | UserCheck | TenantCheck> = [
  // ── post permissions ──────────────────────────────────────────────────────
  [guest,     "read",    "post", alicePost, "guest reads published post"],
  [guest,     "read",    "post", bobDraft,  "guest reads unpublished draft"],
  [alice,     "edit",    "post", alicePost, "user edits own post"],
  [alice,     "edit",    "post", bobDraft,  "user edits another's post"],
  [editor,    "edit",    "post", bobDraft,  "editor edits any post"],
  [editor,    "delete",  "post", bobDraft,  "editor deletes post"],
  [moderator, "delete",  "post", bobDraft,  "moderator deletes any post"],
  // ── user management ───────────────────────────────────────────────────────
  [moderator, "ban",        "user", alice, "moderator bans user"],
  [moderator, "changeRole", "user", alice, "moderator changes user role"],
  [moderator, "remove",     "user", alice, "moderator removes user from tenant"],
  [admin,     "ban",        "user", alice, "admin bans user"],
  [admin,     "changeRole", "user", alice, "admin changes user role"],
  [admin,     "remove",     "user", alice, "admin removes user from tenant"],
  // ── tenant settings ───────────────────────────────────────────────────────
  [moderator, "editSettings", "tenant", undefined, "moderator edits tenant settings"],
  [moderator, "inviteUser",   "tenant", undefined, "moderator invites user"],
  [admin,     "editSettings", "tenant", undefined, "admin edits tenant settings"],
  [admin,     "inviteUser",   "tenant", undefined, "admin invites user"],
  // ── cross-tenant ──────────────────────────────────────────────────────────
  [admin,      "delete", "post", otherPost,  "admin deletes post from OTHER tenant"],
  [otherAdmin, "delete", "post", alicePost,  "other-tenant admin deletes Acme post"],
  [otherAdmin, "ban",    "user", alice,      "other-tenant admin bans Acme user"],
];

console.log("Action".padEnd(46), "Result");
console.log("─".repeat(58));
for (const [user, action, asset, resource, label] of checks) {
  const result = can(user, action, asset, resource as Post | User | undefined);
  console.log(label.padEnd(46), result ? "✓ allowed" : "✗ denied");
}
