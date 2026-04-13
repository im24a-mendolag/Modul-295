function permutations(arr, current = "", res = []) {
    if (arr.length === 0) {
        res.push(current);
        return;
    }
    for (let i = 0; i < arr.length; i++) {
        const remaining = [...arr];
        remaining.splice(i, 1);
        permutations(remaining, current + String(arr[i]), res);
    }
    return res;
}
console.log(permutations([0,1,2,3,4,5,6,7,8,9])[999999]);
