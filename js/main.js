let calculated = false;
let converted = false;

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener("input", function () {
            document.querySelectorAll(`input[name="${this.name}"]`).forEach(otherInput => {
                if (otherInput !== this) {
                    otherInput.value = this.value;
                }
            });
        });
    });
});


function changeValue(inputId, amount) {
    let inputField = document.getElementById(inputId);
    inputField.value = parseInt(inputField.value) + amount;
    inputField.dispatchEvent(new Event("input"));
}

function resetInputs() {
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.value = 0;
    });
}

function calculation() {
    console.log('calculation 시작');

    // 입력 필드 가져오기
    const ageCurrent = parseInt(document.getElementById('input_ageCurrent-desktop').value, 10);
    const ageRetire = parseInt(document.getElementById('input_ageRetire-desktop').value, 10);
    const ageLifespan = parseInt(document.getElementById('input_ageLifespan-desktop').value, 10);

    const saving = parseInt(document.getElementById('input_saving-desktop').value, 10);
    const currentAssets = parseInt(document.getElementById('input_current-desktop').value, 10);
    const spending = parseInt(document.getElementById('input_spend-desktop').value, 10);

    const returnRate = parseFloat(document.getElementById('input_return-desktop').value) / 100;
    const inflationRate = parseFloat(document.getElementById('input_inflation-desktop').value) / 100;

    if (!validation(ageCurrent, ageRetire, ageLifespan, saving, currentAssets, spending, returnRate, inflationRate)) {
        return;
    }

    console.log("✅ 모든 입력값이 유효합니다. 계산을 진행합니다.");

    const totalRetirementAssets = calculateTotalRetirementAssets(ageCurrent, ageRetire, saving, currentAssets, returnRate);
    const totalRetirementAssets_approx = Math.round(totalRetirementAssets / 1000) / 10;

    const requiredRetirementAssets = calculateRequiredRetirementAssets(ageRetire, ageLifespan, spending, returnRate, inflationRate);

    let enough = totalRetirementAssets - requiredRetirementAssets >= 0;
    let assetsDifference = Math.abs(totalRetirementAssets - requiredRetirementAssets);

    updateElementsByName("result_total", totalRetirementAssets.toFixed(0));
    if (totalRetirementAssets_approx >= 1) {
        updateElementsByName("result_total_approx", totalRetirementAssets_approx)
    };
    updateElementsByName("result_need", requiredRetirementAssets.toFixed(0));
    updateElementsByName("result_spare", assetsDifference.toFixed(0));

    if (enough) {
        updateElementsByName("result_text", "충분해요 🎉");
        updateElementsByName("result_label_spare", "여유 자산");
    } else {
        updateElementsByName("result_text", "부족해요 🎉");
        updateElementsByName("result_label_spare", "부족 자산");
    }


    calculated = true;
    console.log(calculated);
}

function validation(ageCurrent, ageRetire, ageLifespan, saving, currentAssets, spending, returnRate, inflationRate) {
    // 나이 검증 (0~150 사이의 정수)
    if (isNaN(ageCurrent) || ageCurrent < 1 || ageCurrent > 150) {
        alert("현재 나이는 0~150 사이의 정수여야 합니다.");
        return false;
    }
    if (isNaN(ageRetire) || ageRetire < 0 || ageRetire > 150 || ageRetire < ageCurrent) {
        alert("은퇴 나이는 0~150 사이의 정수이며, 현재 나이보다 크거나 같아야 합니다.");
        return false;
    }
    if (isNaN(ageLifespan) || ageLifespan < 0 || ageLifespan > 150 || ageLifespan < ageRetire) {
        alert("기대 수명은 0~150 사이의 정수이며, 은퇴 나이보다 크거나 같아야 합니다.");
        return false;
    }

    // 금액 검증 (저축, 자산, 소비)
    if (isNaN(saving) || saving < 0) {
        alert("월 저축 금액은 0 이상의 정수여야 합니다.");
        return false;
    }
    if (isNaN(currentAssets) || currentAssets < 0) {
        alert("현재 자산은 0 이상의 정수여야 합니다.");
        return false;
    }
    if (isNaN(spending) || spending < 1) {
        alert("월 소비 금액은 1 이상의 정수여야 합니다.");
        return false;
    }

    // 경제 변수 검증 (수익률, 인플레이션율)
    if (isNaN(returnRate) || returnRate <= 0) {
        alert("수익률은 0보다 큰 실수여야 합니다.");
        return false;
    }
    if (isNaN(inflationRate) || inflationRate <= 0) {
        alert("인플레이션율은 0보다 큰 실수여야 합니다.");
        return false;
    }

    return true; // 모든 값이 유효한 경우 true 반환
}

function calculateTotalRetirementAssets(ageCurrent, ageRetire, saving, currentAssets, returnRate) {
    let yearsToRetirement = ageRetire - ageCurrent;
    let totalAssets = currentAssets * Math.pow(1 + returnRate, yearsToRetirement); // 현재 자산의 성장

    for (let t = 1; t <= yearsToRetirement; t++) {
        totalAssets += saving * 12 * Math.pow(1 + returnRate, yearsToRetirement - t); // 매년 저축 성장
    }

    return totalAssets;
}

function calculateRequiredRetirementAssets(ageRetire, ageLifespan, spending, returnRate, inflationRate) {
    let yearsInRetirement = ageLifespan - ageRetire;
    let requiredAssets = 0;
    let annualSpending = spending * 12; // 연간 소비 금액

    for (let t = 0; t < yearsInRetirement; t++) {
        requiredAssets += annualSpending * Math.pow(1 + inflationRate, t) / Math.pow(1 + returnRate, t);
    }

    return requiredAssets;
}

function updateElementsByName(name, value) {
    document.getElementsByName(name).forEach(element => {
        element.innerText = value;
    });
}

