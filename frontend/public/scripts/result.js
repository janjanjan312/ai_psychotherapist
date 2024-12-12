// 从 localStorage 获取所有选择
function getSelections() {
    const part1Selections = [];
    const part2Selections = [];

    // 获取 part1 的选择 (9个问题)
    for (let i = 1; i <= 9; i++) {
        const selections = JSON.parse(localStorage.getItem(`quiz${i}`) || '{"adult":{},"child":{}}');
        part1Selections.push(selections);
    }

    // 获取 part2 的选择 (9个问题)
    for (let i = 1; i <= 9; i++) {
        const selections = JSON.parse(localStorage.getItem(`part2_quiz${i}`) || '{"adult":{},"child":{}}');
        part2Selections.push(selections);
    }

    return { part1: part1Selections, part2: part2Selections };
}

// 计算每个部分的分数
function calculateScores(selections) {
    // 计算 part1 的分数
    const part1Adult = selections.part1.reduce((count, q) => 
        count + (Object.values(q.adult).some(v => v) ? 1 : 0), 0);
    const part1Child = selections.part1.reduce((count, q) => 
        count + (Object.values(q.child).some(v => v) ? 1 : 0), 0);

    // 计算 part2 的分数
    const part2Adult = selections.part2.reduce((count, q) => 
        count + (Object.values(q.adult).some(v => v) ? 1 : 0), 0);
    const part2Child = selections.part2.reduce((count, q) => 
        count + (Object.values(q.child).some(v => v) ? 1 : 0), 0);

    return {
        part1: { adult: part1Adult, child: part1Child },
        part2: { adult: part2Adult, child: part2Child }
    };
}

// 评估 ADHD 类型和严重程度
function evaluateADHD(scores) {
    const { part1, part2 } = scores;
    const threshold = 6;

    // 检查各种组合
    const part1AdultSignificant = part1.adult >= threshold;
    const part1ChildSignificant = part1.child >= threshold;
    const part2AdultSignificant = part2.adult >= threshold;
    const part2ChildSignificant = part2.child >= threshold;

    // 确定结果
    if ((part1AdultSignificant || part1ChildSignificant) && 
        (part2AdultSignificant || part2ChildSignificant)) {
        return "The likelihood of having combined-type ADHD appears to be relatively high. Please consider visiting a psychiatrist's office for a proper diagnosis.";
    }

    if (part1AdultSignificant && !part1ChildSignificant) {
        return "You exhibit symptoms of inattentive type ADHD in adulthood but not during childhood, whereas ADHD typically manifests with noticeable symptoms from a young age. The symptoms could stem from other reasons. Please consider visiting a psychiatrist for a proper diagnosis.";
    }

    if (!part1AdultSignificant && part1ChildSignificant) {
        return "You exhibited symptoms of inattentive type ADHD during childhood but not in adulthood, which might suggest that the condition has diminished over time. If you have further questions, please consider consulting a psychiatrist for a thorough evaluation and proper diagnosis.";
    }

    if (part2AdultSignificant && !part2ChildSignificant) {
        return "You exhibit symptoms of hyperactive-impulsive type ADHD in adulthood but not during childhood, whereas ADHD typically manifests with noticeable symptoms from a young age. The symptoms could stem from other reasons. Please consider visiting a psychiatrist for a proper diagnosis.";
    }

    if (!part2AdultSignificant && part2ChildSignificant) {
        return "You exhibited symptoms of hyperactive-impulsive type ADHD during childhood but not in adulthood, which might suggest that the condition has diminished over time. If you have further questions, please consider consulting a psychiatrist for a thorough evaluation and proper diagnosis.";
    }

    if (part1AdultSignificant || part1ChildSignificant) {
        return "The likelihood of having Predominantly inattentive type ADHD appears to be relatively high. Please consider visiting a psychiatrist for a proper diagnosis.";
    }

    if (part2AdultSignificant || part2ChildSignificant) {
        return "The likelihood of having Predominantly hyperactive-impulsive type ADHD appears to be relatively high. Please consider visiting a psychiatrist for a proper diagnosis.";
    }

    return "The likelihood of having ADHD appears to be relatively low. If you have further questions, please try other tests and consider visiting a psychiatrist's office for a proper diagnosis.";
}

// 显示结果
function displayResult() {
    const selections = getSelections();
    const scores = calculateScores(selections);
    let result = evaluateADHD(scores);

    // 添加颜色标记、大写和粗体
    result = result
        .replace(/high/gi, '<span style="color: red; font-weight: bold;">HIGH</span>')
        .replace(/low/gi, '<span style="color: green; font-weight: bold;">LOW</span>')
        .replace(/\. Please/g, '.<br><br>Please');  // 在句号后添加换行

    const resultText = document.querySelector('.result-text');
    resultText.innerHTML = result;
}

// 页面加载时显示结果
document.addEventListener('DOMContentLoaded', displayResult); 