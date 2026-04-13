function simulateDelay(ms) {
    return new Promise(function(resolve) {
        setTimeout(resolve, ms);
    });
};

async function addAfterDelay(num1,num2,delay) {
    await simulateDelay(delay);
    return num1 + num2;
};

const result = await addAfterDelay(3, 7, 2000);
console.log('Das Ergebnis ist:', result);
