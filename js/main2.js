let calculated = false;
let converted = false;

document.addEventListener("DOMContentLoaded", function () {
    //정수 입력값 validation 및 3자리 마다 콤마 처리
    document.querySelectorAll('input.number-format').forEach(function(input) {
    // 입력 시 콤마 추가
        input.addEventListener('input', function () {
            let value = input.value.replace(/,/g, '');  // 콤마 제거
            if (!/^\d*$/.test(value)) {
            value = value.replace(/\D/g, ''); // 숫자 이외 제거
            }
            input.value = value === '' ? '' : Number(value).toLocaleString();
        });
    });

    //float 입력값 validation 및 3자리 마다 콤마 처리
    document.querySelectorAll('input.float-format').forEach(function(input) {
        input.addEventListener('input', function () {
            let value = input.value.replace(/,/g, '');  // 콤마 제거
    
            // 숫자 또는 소수점만 남김 (단, 소수점은 하나만 허용)
            if (!/^\d*\.?\d*$/.test(value)) {
                value = value.replace(/[^0-9.]/g, '');  // 숫자와 점만 남김
                const parts = value.split('.');
                if (parts.length > 2) {
                    // 소수점이 여러 개면 첫 번째만 유지
                    value = parts[0] + '.' + parts.slice(1).join('');
                }
            }
    
            // 콤마 포맷 적용 (정수 부분에만)
            if (value.includes('.')) {
                const [intPart, decimalPart] = value.split('.');
                input.value = Number(intPart).toLocaleString() + '.' + decimalPart;
            } else {
                input.value = value === '' ? '' : Number(value).toLocaleString();
            }
        });
    });

    syncInputValues();

    clearButtonActivate('.input_text');
    clearButtonActivate('.input_text-1');
    clearButtonActivate('.input_text-2');

    // 참고자료 열기/닫기
    toggleAsideContent('.aside_content1');
    toggleAsideContent('.aside_content2');
    toggleAsideContent('.aside_content3');
    toggleAsideContent('.aside_content4');
});

function syncInputValues() {
    document.querySelectorAll('input[type="text"]').forEach(input => {
        input.addEventListener("input", function (e) {

            document.querySelectorAll(`input[name="${this.name}"]`).forEach(otherInput => {
                if (otherInput !== this) {
                    otherInput.value = this.value;
                }
            });

            clearButtonActivate('.input_text');
            clearButtonActivate('.input_text-1');
            clearButtonActivate('.input_text-2');
        });
    });
}

function clearButtonActivate(className) {
    document.querySelectorAll(className).forEach(function(wrapper) {
        const input = wrapper.querySelector('input');
        const clearBtn = wrapper.querySelector('.clear-btn');

        if (!clearBtn) {
            console.log(className);
            console.log('no clear button HTML tag!');
            return;
        }

        if (input.value != '') {
            clearBtn.style.display = 'block';
        } else {
            clearBtn.style.display = 'none';
        }

        function toggleClearBtn() {
            if (input.value.trim() !== '') {
              clearBtn.style.display = 'block';
            } else {
              clearBtn.style.display = 'none';
            }
          }
        
        input.addEventListener('input', toggleClearBtn);
      
        // 버튼 클릭 시 입력값 비우기 + 다시 focus
        clearBtn.addEventListener('click', function() {
          input.value = '';
          input.dispatchEvent(new Event('input', { bubbles: true }));
          toggleClearBtn();
        });
      });
}

function toggleAsideContent(selector) {
    document.querySelectorAll(selector).forEach(function (container) {
      const title = container.querySelector('[class$="_title"]');
      const arrow = title.querySelector('.aside_content_arrow');
      const content = title.nextElementSibling;

      if (!title || !content || !arrow) return;

      // 기본은 보이도록
      content.style.display = 'none';
      arrow.style.transform = 'rotate(180deg)';

      title.style.cursor = 'pointer';

      title.addEventListener('click', function () {
        const isVisible = content.style.display !== 'none';
        content.style.display = isVisible ? 'none' : 'flex';

        // 이미지 회전으로 토글 표시
        arrow.style.transform = isVisible ? 'rotate(180deg)' : 'rotate(0deg)';
        arrow.style.transition = 'transform 0.2s ease';
      });
    });
  }


function changeValue(inputId, amount) {
    let inputField = document.getElementById(inputId);
    const value = parseInt(inputField.value.replace(/,/g, ''), 10);
    if (!inputField.value) {
        inputField.value = amount;
    } else {
        inputField.value = value + amount;
    }
    inputField.dispatchEvent(new Event("input"));
}

function resetInputs() {
    document.querySelectorAll('input.number-format, input.float-format').forEach(input => {
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
}

function calculation() {
    console.log('===================================');
    console.log('calculation 시작');

    // 입력 필드 가져오기
    const ageCurrent = parseInt(document.getElementById('input_ageCurrent-desktop').value.replace(/,/g, ''), 10);
    const ageRetire = parseInt(document.getElementById('input_ageRetire-desktop').value.replace(/,/g, ''), 10);
    const ageLifespan = parseInt(document.getElementById('input_ageLifespan-desktop').value.replace(/,/g, ''), 10);

    const saving = parseInt(document.getElementById('input_saving-desktop').value.replace(/,/g, ''), 10);
    const currentAssets = parseInt(document.getElementById('input_current-desktop').value.replace(/,/g, ''), 10);
    const spending = parseInt(document.getElementById('input_spend-desktop').value.replace(/,/g, ''), 10);

    const returnRate = parseFloat(document.getElementById('input_return-desktop').value.replace(/,/g, '')) / 100;
    const inflationRate = parseFloat(document.getElementById('input_inflation-desktop').value.replace(/,/g, '')) / 100;
    const savingIncreaseRate = 0; // 저축액 상승률

    const isChecked = document.getElementsByName("conversion_check")[0].checked;

    if (!validation(ageCurrent, ageRetire, ageLifespan, saving, currentAssets, spending, returnRate, inflationRate, isChecked)) {
        return;
    }

    console.log("✅ 모든 입력값이 유효합니다. 계산을 진행합니다.");
    console.log("현재 가치 전환 활성화 여부: ", isChecked);

    let totalRetirementAssets = calculateTotalRetirementAssets(ageCurrent, ageRetire, saving, currentAssets, returnRate, savingIncreaseRate);
    let requiredRetirementAssets = calculateRequiredRetirementAssets(ageCurrent, ageRetire, ageLifespan, spending, returnRate, inflationRate);
    let spendMax = calculateRetirementSpendingMax(ageCurrent, ageRetire, ageLifespan, returnRate, inflationRate, totalRetirementAssets);
    let [retirePossible, retire_over_lifespan] = calculateRetirementAgePossible(ageCurrent, ageLifespan, saving, currentAssets, spending, returnRate, inflationRate, savingIncreaseRate);
    let [lifespanPossible, lifespan_over_120] = calculateRetirementLifespanPossible(ageCurrent, ageRetire, spending, returnRate, inflationRate, totalRetirementAssets);
    let [savingRequired, saving_not_required] = calculateRetirementSavingRequired(ageCurrent, ageRetire, currentAssets, returnRate, savingIncreaseRate, requiredRetirementAssets);
    let returnRequired = calculateRetirementReturnRequired(ageCurrent, ageRetire, ageLifespan, saving, currentAssets, spending, inflationRate, savingIncreaseRate);
    // let inflationMax = calculatedRetirementInflationMax(ageCurrent, ageRetire, ageLifespan, spending, returnRate, totalRetirementAssets)

    const totalRetirementAssets_approx = Math.round(totalRetirementAssets / 1000) / 10;
    const requiredRetirementAssets_approx = Math.round(requiredRetirementAssets / 1000) / 10;

    let assetsDifference = Math.abs(totalRetirementAssets - requiredRetirementAssets);
    const assetsDifference_approx = Math.round(assetsDifference / 1000) / 10;

    // 자산 충분 여부에 따른 색상/글귀 일괄 변경
    let enough = totalRetirementAssets - requiredRetirementAssets >= 0;
    updateEnoughColor(enough);
    updateEnoughElements(enough);

    // 은퇴 예상 자산
    updateElementsByName("result_total", parseFloat(totalRetirementAssets.toFixed(0)));
    if (totalRetirementAssets_approx >= 0.1) {
        updateElementsByName("result_total_approx", totalRetirementAssets_approx);
    } else {
        updateElementsByName("result_total_approx", '-');
    }

    // 은퇴 필요 자산
    updateElementsByName("result_need", parseFloat(requiredRetirementAssets.toFixed(0)));
    if (requiredRetirementAssets_approx >= 0.1) {
        updateElementsByName("result_need_approx", requiredRetirementAssets_approx);
    } else {
        updateElementsByName("result_need_approx", '-');
    }

    // 은퇴 여유/부족 금액
    updateElementsByName("result_spare", parseFloat(assetsDifference.toFixed(0)));
    if (assetsDifference_approx >= 0.1) {
        updateElementsByName("result_spare_approx", assetsDifference_approx);
    } else {
        updateElementsByName("result_spare_approx", '-');
    }

    // 은퇴 후 월 생활비
    updateElementsByName("result_spendMax", parseFloat(spendMax.toFixed(0)));
    updateElementsByName("result_spendInput", spending);
    updateElementsByName("spendDiff", Math.abs(spendMax - spending).toFixed(0));

    // 은퇴 가능 나이
    updateElementsByName("result_retirePossible", retirePossible);
    updateElementsByName("result_retireInput", ageRetire);
    updateElementsByName("result_retireDiff", Math.abs(retirePossible - ageRetire));
    console.log('은퇴불가여부: ', retire_over_lifespan);
    warningElementsByname("retirePossible_text", retire_over_lifespan);

    // 은퇴 후 수명
    updateElementsByName("result_lifespanPossible", lifespanPossible);
    updateElementsByName("result_lifespanInput", ageLifespan);
    updateElementsByName("result_lifespanDiff", Math.abs(lifespanPossible - ageLifespan));
    console.log('120세 이상 가능 여부: ', lifespan_over_120);
    warningElementsByname("lifespanPossible_text", lifespan_over_120);

    // 월 저축금액
    updateElementsByName("result_savingRequired", parseFloat(savingRequired.toFixed(0)));
    updateElementsByName("result_savingInput", saving);
    updateElementsByName("result_savingDiff", Math.abs(savingRequired - saving).toFixed(0));
    console.log('저축없이 은퇴 가능 여부: ', saving_not_required);
    warningElementsByname("savingRequired_text", saving_not_required);

    // 목표 수익률
    updateElementsByName("result_returnRequired", parseFloat((returnRequired).toFixed(1)));
    updateElementsByName("result_returnInput", returnRate*100);
    updateElementsByName("result_returnDiff", Math.abs(returnRequired - returnRate*100).toFixed(1));
    warningElementsByname("returnRequired_text", (parseFloat((returnRequired).toFixed(1)) == 0))

    // // 예상 인플레이션
    // console.log('최대 가능 inflation', inflationMax);
    // updateElementsByName("result_inflationMax", parseFloat(inflationMax.toFixed(1)));
    // updateElementsByName("result_inflationInput", inflationRate*100);
    // updateElementsByName("result_inflationDiff", Math.abs(inflationMax - inflationRate*100).toFixed(1));


    calculated = true;
    console.log("계산 완료 여부: ", calculated);

    // (in case 활성화) 현재 가치로 환산
    if (isChecked) {
        convsertPresentValue();
    }
}

function validation(ageCurrent, ageRetire, ageLifespan, saving, currentAssets, spending, returnRate, inflationRate) {
    // 나이 검증 (0~120 사이의 정수)
    if (isNaN(ageCurrent) || ageCurrent < 1 || ageCurrent > 120) {
        alert("현재 나이는 0~120 사이의 정수여야 합니다.");
        return false;
    }
    if (isNaN(ageRetire) || ageRetire < 0 || ageRetire > 120 || ageRetire < ageCurrent) {
        alert("은퇴 나이는 0~120 사이의 정수이며, 현재 나이보다 크거나 같아야 합니다.");
        return false;
    }
    if (isNaN(ageLifespan) || ageLifespan < 0 || ageLifespan > 120 || ageLifespan < ageRetire) {
        alert("기대 수명은 0~120 사이의 정수이며, 은퇴 나이보다 크거나 같아야 합니다.");
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

function calculateTotalRetirementAssets(ageCurrent, ageRetire, saving, currentAssets, returnRate, savingIncreaseRate) {
    let yearsToRetirement = ageRetire - ageCurrent;
    let totalAssets = currentAssets * Math.pow(1 + returnRate, yearsToRetirement); // 현재 자산의 성장

    for (let t = 1; t <= yearsToRetirement; t++) {
        let adjustedSaving = saving * Math.pow(1 + savingIncreaseRate, t - 1); // t년 차에 인플레이션이 반영된 월 저축액
        totalAssets += adjustedSaving * 12 * Math.pow(1 + returnRate, yearsToRetirement - t); // 저축 성장
    }

    return totalAssets;
}

function calculateRequiredRetirementAssets(ageCurrent, ageRetire, ageLifespan, spending, returnRate, inflationRate) {
    const yearsUntilRetirement = ageRetire - ageCurrent;
    const retirementYears = ageLifespan - ageRetire;
  
    const i = inflationRate;
    const r = returnRate;
  
    // 1. 은퇴 시점 기준 연간 소비 금액 (현재 가치 소비를 물가상승률로 증가시킴)
    const annualSpendingAtRetirement = spending * 12 * Math.pow(1 + i, yearsUntilRetirement);
  
    // 2. 실질 수익률 계산
    const realRate = (1 + r) / (1 + i) - 1;
  
    let requiredAssets;
  
    if (Math.abs(realRate) < 1e-10) {
      // 실질 수익률이 0%일 경우 단순 계산
      requiredAssets = annualSpendingAtRetirement * retirementYears;
    } else {
      // 연금 공식으로 은퇴 시점 자산 계산
      requiredAssets =
        annualSpendingAtRetirement * (1 - Math.pow(1 + realRate, -retirementYears)) / realRate;
    }
  
    return requiredAssets;
}

function calculateRetirementSpendingMax(ageCurrent, ageRetire, ageLifespan, returnRate, inflationRate, totalRetirementAssets) {
    const retirementYears = ageLifespan - ageRetire;
    const yearsUntilRetirement = ageRetire - ageCurrent;
  
    // 실질 수익률
    const realRate = (1 + returnRate) / (1 + inflationRate) - 1;
  
    let annualSpendingAtRetirement;
  
    if (Math.abs(realRate) < 1e-10) {
      // 실질 수익률이 0일 때
      annualSpendingAtRetirement = totalRetirementAssets / retirementYears;
    } else {
      // 사망 시 자산 0 가정 (정확히 n년간 인출)
      annualSpendingAtRetirement =
        (totalRetirementAssets * realRate) / (1 - Math.pow(1 + realRate, -retirementYears));
    }
  
    // 현재 가치 기준으로 환산
    const annualSpendingTodayValue =
      annualSpendingAtRetirement / Math.pow(1 + inflationRate, yearsUntilRetirement);
  
    return annualSpendingTodayValue / 12;
}

function calculateRetirementAgePossible(ageCurrent, ageLifespan, saving, currentAssets, spending, returnRate, inflationRate, savingIncreaseRate) {
    const annualSaving = saving * 12;
    let age = ageCurrent;
    let assets = currentAssets;
    let years = 0;

    while (true) {
        requiredAssets = calculateRequiredRetirementAssets(ageCurrent, age, ageLifespan, spending, returnRate, inflationRate);
        if (assets >= requiredAssets) {
            return [age, false];
        }

        assets *= (1 + returnRate);
        assets += annualSaving * Math.pow(1 + savingIncreaseRate, years);
        age ++;
        years ++;

        // 현실적 한계 설정 (무한 루프 방지)
        if (age >= ageLifespan) {
            return [age, true]; // 은퇴자산 도달 불가
        }
    }
}

function calculateRetirementLifespanPossible(ageCurrent, ageRetire, spending, returnRate, inflationRate, totalRetirementAssets) {
    let age = ageRetire;
    let assets = totalRetirementAssets;
  
    // 현재 기준 월 지출 → 연 지출로 변환
    const annualSpendingToday = spending * 12;
  
    // 은퇴 시점의 연 지출금액 (물가상승 반영)
    const yearsUntilRetirement = ageRetire - ageCurrent;
    let annualSpending = annualSpendingToday * Math.pow(1 + inflationRate, yearsUntilRetirement);
  
    while (assets > 0) {
      assets *= (1 + returnRate);          // 자산 수익률 적용
      assets -= annualSpending;            // 연 지출 차감
  
      if (assets < 0) {
        return [age, false];
      }
  
      annualSpending *= (1 + inflationRate); // 다음 해 물가상승 반영
      age++;
      
      // 무한루프 방지 (비정상 값 대비)
      if (age >120) {
        return ['120↑ ', true];
      }
    }
}

function calculateRetirementSavingRequired(ageCurrent, ageRetire, currentAssets, returnRate, savingIncreaseRate, requiredRetirementAssets) {
    const years = ageRetire - ageCurrent;

    // 현재 자산의 미래 가치
    const futureValueOfCurrentAssets = currentAssets * Math.pow(1 + returnRate, years);
  
    // 저축으로 채워야 하는 금액
    const neededSavings = requiredRetirementAssets - futureValueOfCurrentAssets;
  
    if (neededSavings <= 0) {
      // 이미 자산이 충분한 경우
      return [0, true];
    }

    // 필요한 저축액 추정 알고리즘
    let lower = 0;
    let upper = neededSavings;
    let precision = 0.1; // 0.1만원 단위 정밀도

    while (upper - lower > precision) {
        let mid = (lower + upper) / 2;
        let estimatedAssets = simulateFutureAssets(mid, returnRate, savingIncreaseRate, years);

        if (estimatedAssets < neededSavings) {
            lower = mid;
        } else {
            upper = mid;
        }
    }

    const saving_result = Math.round((lower + upper) / 2 / 12);

    return [saving_result, false];

    function simulateFutureAssets(annualSaving, returnRate, savingIncreaseRate, years) {
        let total = 0;
        for (let t = 1; t <= years; t++) {
            let adjustedSaving = annualSaving * Math.pow(1 + savingIncreaseRate, t-1);
            let futureValue = adjustedSaving * Math.pow(1 + returnRate, years - t);
            total += futureValue;
        }
        return total;
    }
  }

function calculateRetirementReturnRequired(ageCurrent, ageRetire, ageLifespan, saving, currentAssets, spending, inflationRate, savingIncreaseRate) {
    const years = ageRetire - ageCurrent;
    const annualSaving = saving * 12;

    // 이진 탐색으로 필요한 수익률(r)을 구함
    let low = 0;
    let high = 1; // 100% 연수익률
    const epsilon = 0.0001; // 허용 오차

    function futureValue(rate) {
        let fv = currentAssets;
        for (let i = 0; i < years; i++) {
        fv = fv * (1 + rate) + annualSaving * Math.pow(1 + savingIncreaseRate, i);
        }
        return fv;
    }

    while (high - low > epsilon) {
        const mid = (low + high) / 2;
        const fv = futureValue(mid);
        const required = calculateRequiredRetirementAssets(ageCurrent, ageRetire, ageLifespan, spending, mid, inflationRate);
        if (fv < required) {
        low = mid;
        } else {
        high = mid;
        }
    }

    // 백분율로 출력
    const requiredRate = ((low + high) / 2) * 100;
    return requiredRate;
}

// function calculatedRetirementInflationMax(ageCurrent, ageRetire, ageLifespan, spending, returnRate, totalRetirementAssets) {
//     let low = 0;
//     let high = 1.0; // 100% 물가상승률까지 탐색
//     const epsilon = 1e-6;
//     const requiredRetirementAssetsZero = calculateRequiredRetirementAssets(ageCurrent, ageRetire, ageLifespan, spending, returnRate, 0);

//     if (totalRetirementAssets <= requiredRetirementAssetsZero) {
//         return 0
//     }
  
//     while (high - low > epsilon) {
//       const mid = (low + high) / 2;
//       const inflationRate = mid;
//       const requiredRetirementAssetsMid = calculateRequiredRetirementAssets(ageCurrent, ageRetire, ageLifespan, spending, returnRate, inflationRate)

//       if (totalRetirementAssets >= requiredRetirementAssetsMid) {
//         low = mid;
//       } else {
//         high = mid;
//       }
//     }
    
//     const maxInflation = ((low + high) / 2) * 100;
//     return maxInflation;
// }

function updateElementsByName(name, value) {
    document.getElementsByName(name).forEach(element => {
        if (typeof value === 'number') {
            element.innerText = value.toLocaleString('en-US');
        } else {
            element.innerText = value;
        }

    });
}

function warningElementsByname(name, bool) {
    document.getElementsByName(name).forEach(element => {
        const defaultElement = element.querySelector('[name="default"]');
        const warningElement = element.querySelector('[name="warning"]');

        if (bool) {
            defaultElement.style.display = 'none';
            warningElement.style.display = 'flex';
        } else {
            defaultElement.style.display = 'flex';
            warningElement.style.display = 'none';
        }
    });
}

function updateEnoughElements(enough) {
    if (enough) {
        updateElementsByName("result_text", "충분해요 🎉");
        updateElementsByName("result_label_spare", "은퇴 시 \n여유 금액");
        updateElementsByName("result_text2", "더 넉넉하게 생활할 수 있어요!");
        updateElementsByName("result_text3", "의 여유가 더 있네요");
        updateElementsByName("result_text4", "일찍 은퇴해도 되어요");
        updateElementsByName("result_text5", "더 살아도 여유가 있어요");
        updateElementsByName("result_text6", "의 저축을 줄여도 여유가 있어요");
        updateElementsByName("result_text7", "수익률이 덜 나와도 괜찮아요");
    } else {
        updateElementsByName("result_text", "부족해요 😫");
        updateElementsByName("result_label_spare", "은퇴 시 \n부족 금액");
        updateElementsByName("result_text2", "현재 은퇴 계획으로는 생활이 어려워요.");
        updateElementsByName("result_text3", "만큼 적게 써야 해요");
        updateElementsByName("result_text4", "더 늦게 은퇴해야 해요");
        updateElementsByName("result_text5", "동안은 삶에 여유가 없어요");
        updateElementsByName("result_text6", "의 저축을 더 늘려야 해요");
        updateElementsByName("result_text7", "수익률을 더 올려야 해요");
    }
}

function updateEnoughColor(enough) {
    if (enough) {
        document.querySelectorAll('[name="result_spare_box"]').forEach(elem => {
            elem.style.backgroundColor = 'var(--primary-colorblue200)';
          });
        
        document.querySelectorAll('[name="result_label_spare"]').forEach(elem => {
            elem.style.color = 'var(--primary-colorblue500)';
        });

        document.querySelectorAll('[name="result_spare_box_icn"]').forEach(elem => {
            elem.style.backgroundColor = 'var(--primary-colorblue500)';
            elem.innerHTML = `<img class="union-plus" src="img/union-2@2x.png" alt="Union" />`;
            });

        const enough_red_elements = document.querySelectorAll('.sfprotext-medium-red-orange-15px');
        const enough_blue_elements = document.querySelectorAll('.sfprotext-medium-azure-radiance-15px');

        enough_red_elements.forEach (elem => {
            elem.style.color = 'var(--primary-colorred500)';
        });

        enough_blue_elements.forEach (elem => {
            elem.style.color = 'var(--primary-colorblue500)';
        });

    } else {
        document.querySelectorAll('[name="result_spare_box"]').forEach(elem => {
            elem.style.backgroundColor = 'var(--primary-colorred200)';
          });
        
        document.querySelectorAll('[name="result_label_spare"]').forEach(elem => {
            elem.style.color = 'var(--primary-colorred500)';
        });

        document.querySelectorAll('[name="result_spare_box_icn"]').forEach(elem => {
            elem.style.backgroundColor = 'var(--primary-colorred500)';
            elem.innerHTML = `<img class="union-minus" src="img/union-91@2x.png" alt="Union" />`;
            });

        const enough_red_elements = document.querySelectorAll('.sfprotext-medium-red-orange-15px');
        const enough_blue_elements = document.querySelectorAll('.sfprotext-medium-azure-radiance-15px');

        enough_red_elements.forEach (elem => {
            elem.style.color = 'var(--primary-colorblue500)';
        });

        enough_blue_elements.forEach (elem => {
            elem.style.color = 'var(--primary-colorred500)';
        });
    }
}

function convertCurrentValue(value, ageCurrent, ageRetire, inflationRate) {
    const yearsUntilRetire = ageRetire - ageCurrent;
  
    // 물가상승률을 반영한 현재 가치 계산 (복리 할인)
    const presentValue = value / Math.pow(1 + inflationRate, yearsUntilRetire);
  
    return presentValue;
}

document.querySelectorAll('input[name="conversion_check"]').forEach(checkbox => {
    checkbox.addEventListener('change', function () {
        //다른 conversion_check들도 동기화
        document.querySelectorAll('input[name="conversion_check"]').forEach(other => {
            if (other !== this) other.checked = this.checked;
          });

        const boxes = document.querySelectorAll('.result_fin_box_present, .result_need_spare_box_present');
        boxes.forEach(box => {
        box.classList.toggle('hidden');
        });

        if (this.checked) {
        convsertPresentValue(); // 체크되었을 때
        }
})});

function convsertPresentValue() {
    console.log("현재 가치로 환산하기");

    if (calculated) {
        const ageCurrent = parseInt(document.getElementById('input_ageCurrent-desktop').value.replace(/,/g, ''), 10);
        const ageRetire = parseInt(document.getElementById('input_ageRetire-desktop').value.replace(/,/g, ''), 10);
        const inflationRate = parseFloat(document.getElementById('input_inflation-desktop').value.replace(/,/g, '')) / 100;
    
        const years = ageRetire - ageCurrent;
    
        // 현재 페이지에서 값 가져오기
        let total = parseFloat(document.getElementsByName("result_total")[0].innerText.replace(/,/g, ""));
        let need = parseFloat(document.getElementsByName("result_need")[0].innerText.replace(/,/g, ""));
        let spare = parseFloat(document.getElementsByName("result_spare")[0].innerText.replace(/,/g, ""));
    
        // 변환 함수 정의
        const convert = (val) => val / Math.pow(1 + inflationRate, years);

        total = convert(total);
        need = convert(need);
        spare = convert(spare);

        let total_approx = Math.round(total / 1000) / 10;
        let need_approx = Math.round(need / 1000) / 10;
        let spare_approx = Math.round(spare / 1000) / 10;

        if (total_approx >= 0.1) {
            updateElementsByName("result_fin_box_present_value", total_approx);
        } else {
            updateElementsByName("result_fin_box_present_value", '-');
        }

        updateElementsByName("result_fin_box_present_applied", `인플레이션 ${inflationRate*100}% x ${years}년 적용`)

        if (need_approx >= 0.1) {
            updateElementsByName("result_need_box_present_value", need_approx);
        } else {
            updateElementsByName("result_need_box_present_value", '-');
        }

        if (spare_approx >= 0.1) {
            updateElementsByName("result_spare_box_present_value", spare_approx);
        } else {
            updateElementsByName("result_spare_box_present_value", '-');
        }

    } else {
        console.log("아직 계산 결과가 없습니다.")
    }

}