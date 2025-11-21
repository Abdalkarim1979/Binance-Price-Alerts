const alerts = [];
let repeatAudio = null;
let flashingAlerts = {};
let previousPrices = {};
let timeFrame = '24h'; // Default time frame

function showToast(message, type) {
  const toast = document.createElement("div");
  toast.className = `toast ${type} show`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 500);
  }, 4000);
}

// Function to get historical data from Binance for different time frames
async function getHistoricalData(symbol, interval, limit = 1) {
  try {
    const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching ${interval} data for ${symbol}:`, error);
    return null;
  }
}

// Function to get current price
async function getCurrentPrice(symbol) {
  try {
    const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
    const data = await response.json();
    return parseFloat(data.price);
  } catch (error) {
    console.error(`Error fetching current price for ${symbol}:`, error);
    return null;
  }
}

// Function to calculate price change for different time frames
async function calculatePriceChange(symbol, timeFrame) {
  try {
    const currentPrice = await getCurrentPrice(symbol);
    if (!currentPrice) return null;

    let interval, limit, timeLabel;
    
    switch (timeFrame) {
      case '1h':
        interval = '1h';
        limit = 1;
        timeLabel = '1H';
        break;
      case '4h':
        interval = '4h';
        limit = 1;
        timeLabel = '4H';
        break;
      case '24h':
        interval = '1d';
        limit = 1;
        timeLabel = '24H';
        break;
      case '7d':
        interval = '1d';
        limit = 7;
        timeLabel = '7D';
        break;
      case '30d':
        interval = '1d';
        limit = 30;
        timeLabel = '30D';
        break;
      default:
        interval = '1d';
        limit = 1;
        timeLabel = '24H';
    }

    const historicalData = await getHistoricalData(symbol, interval, limit);
    if (!historicalData || historicalData.length === 0) return null;

    let previousPrice;
    
    if (timeFrame === '7d' || timeFrame === '30d') {
      // For multiple days, use the first candle's open price
      previousPrice = parseFloat(historicalData[0][1]); // Open price of first candle
    } else {
      // For single period, use the previous candle's close price
      previousPrice = parseFloat(historicalData[historicalData.length - 1][1]); // Open price
    }

    const changeAmount = currentPrice - previousPrice;
    const changePercent = (changeAmount / previousPrice) * 100;

    return {
      changeAmount,
      changePercent,
      timeLabel,
      currentPrice,
      previousPrice
    };
  } catch (error) {
    console.error(`Error calculating price change for ${symbol} (${timeFrame}):`, error);
    return null;
  }
}

// Function to calculate price based on percentage
function calculatePriceByPercentage(currentPrice, percentage, direction) {
  const multiplier = direction === 'up' ? (1 + percentage / 100) : (1 - percentage / 100);
  return currentPrice * multiplier;
}

// Function to update price change display for different time frames
async function updatePriceChange(symbol) {
  const changeElement = document.getElementById(`change-${symbol}`);
  
  if (!changeElement) return;

  try {
    const changeData = await calculatePriceChange(symbol, timeFrame);
    
    if (changeData) {
      const { changeAmount, changePercent, timeLabel, currentPrice, previousPrice } = changeData;
      
      // Update change element
      changeElement.className = `price-change ${changePercent >= 0 ? 'positive' : 'negative'}`;
      
      const directionSymbol = changePercent >= 0 ? '↗️' : '↘️';
      
      const percentageText = changePercent >= 0 ? 
        `+${changePercent.toFixed(2)}%` : 
        `${changePercent.toFixed(2)}%`;
      
      const amountText = changeAmount >= 0 ? 
        `+$${Math.abs(changeAmount).toFixed(2)}` : 
        `-$${Math.abs(changeAmount).toFixed(2)}`;
      
      changeElement.innerHTML = `
        <span class="change-percentage">${directionSymbol} ${percentageText} (${timeLabel})</span>
        <span class="change-amount">${amountText}</span>
        <div class="time-frame-info">From $${previousPrice.toFixed(2)} to $${currentPrice.toFixed(2)}</div>
      `;
    } else {
      changeElement.innerHTML = `<span class="change-percentage">⚠️ No data available</span>`;
    }
  } catch (error) {
    changeElement.innerHTML = `<span class="change-percentage">⚠️ Data error</span>`;
  }
}

function renderAlert(alert) {
  const div = document.createElement("div");
  div.className = "alert-item";
  div.id = `alert-${alert.id}`;
  div.innerHTML = `
    <strong>${alert.symbol.slice(0, -4)}</strong><br>
    <span id="price-${alert.symbol}" class="price-label">...</span>
    <div id="change-${alert.symbol}" class="price-change neutral">
      <span class="change-percentage">Loading...</span>
      <span class="change-amount"></span>
    </div>

    <div id="targets-${alert.id}" class="target-section">
      <button class="delete-btn" onclick="removeAlert(${alert.id})">🗑️</button>
      <br>
      
      ⬆️ Up
      <div class="input-group">
        <input class="target-input" type="number" placeholder="Upper Price" 
          onchange="updateTarget(${alert.id}, 'up', this.value, 'price')" />
        <span class="input-or">OR</span>
        <input class="percentage-input" type="number" placeholder="Percentage %" step="0.1"
          onchange="updateTarget(${alert.id}, 'up', this.value, 'percentage')" />
      </div>
      <select onchange="setMode(${alert.id}, 'up', this.value)">
        <option value="once">Once</option>
        <option value="repeat">Repeat</option>
      </select>
      <button class="toggle-btn" onclick="toggleAlert(${alert.id}, 'up', this)">🔕 Inactive</button><br>

      ⬇️ Down
      <div class="input-group">
        <input class="target-input" type="number" placeholder="Lower Price"
          onchange="updateTarget(${alert.id}, 'down', this.value, 'price')" />
        <span class="input-or">OR</span>
        <input class="percentage-input" type="number" placeholder="Percentage %" step="0.1"
          onchange="updateTarget(${alert.id}, 'down', this.value, 'percentage')" />
      </div>
      <select onchange="setMode(${alert.id}, 'down', this.value)">
        <option value="once">Once</option>
        <option value="repeat">Repeat</option>
      </select>
      <button class="toggle-btn" onclick="toggleAlert(${alert.id}, 'down', this)">🔕 Inactive</button>
    </div>
    <br>
  `;
  document.getElementById("alerts-list").appendChild(div);
  
  // Fetch price change data immediately when creating the card
  updatePriceChange(alert.symbol);
}

function addAlert() {
  const symbol = document.getElementById("symbol-input").value.toUpperCase().trim();
  if (!symbol) {
    showToast("⚠️ Please enter a symbol", "down");
    return;
  }
  
  if (!symbol.endsWith('USDT')) {
    showToast("⚠️ Please add USDT at the end of the symbol", "down");
    return;
  }
  
  if (alerts.find(a => a.symbol === symbol)) {
    showToast("⚠️ This symbol already exists", "down");
    return;
  }
  
  const alert = {
    id: Date.now(),
    symbol,
    up: { price: null, percentage: null, enabled: false, triggered: false, mode: "once" },
    down: { price: null, percentage: null, enabled: false, triggered: false, mode: "once" }
  };
  alerts.push(alert);
  renderAlert(alert);
  document.getElementById("symbol-input").value = '';
  saveAlertsToStorage();
  showToast("✅ Symbol added successfully", "up");
}

function updateTarget(id, dir, value, type) {
  const a = alerts.find(x => x.id === id);
  if (a) {
    if (type === 'percentage') {
      a[dir].percentage = parseFloat(value);
      a[dir].price = null; // Clear price when percentage is set
      
      // Clear the other input
      const inputs = document.querySelectorAll(`#alert-${id} .${dir === 'up' ? 'target-input' : 'target-input'}`);
      if (inputs[0]) inputs[0].value = '';
      
      showToast(`✅ Updated ${dir === 'up' ? 'upper' : 'lower'} percentage for ${a.symbol.slice(0, -4)}: ${value}%`, "up");
    } else {
      a[dir].price = parseFloat(value);
      a[dir].percentage = null; // Clear percentage when price is set
      
      // Clear the other input
      const inputs = document.querySelectorAll(`#alert-${id} .${dir === 'up' ? 'percentage-input' : 'percentage-input'}`);
      if (inputs[0]) inputs[0].value = '';
      
      showToast(`✅ Updated ${dir === 'up' ? 'upper' : 'lower'} price for ${a.symbol.slice(0, -4)}`, "up");
    }
    a[dir].triggered = false;
  }
  saveAlertsToStorage();
}

function setMode(id, dir, value) {
  const a = alerts.find(x => x.id === id);
  if (a) {
    a[dir].mode = value;
    showToast(`✅ Set mode for ${dir === 'up' ? 'upper' : 'lower'} - ${value === 'once' ? 'Once' : 'Repeat'}`, "up");
  }
  saveAlertsToStorage();
}

function toggleAlert(id, dir, btn) {
  const a = alerts.find(x => x.id === id);
  if (a && (a[dir].price !== null || a[dir].percentage !== null)) {
    a[dir].enabled = !a[dir].enabled;
    a[dir].triggered = false;
    btn.textContent = a[dir].enabled ? "🔔 Active" : "🔕 Inactive";
    btn.classList.toggle("active", a[dir].enabled);
    
    const action = a[dir].enabled ? 'activated' : 'deactivated';
    const targetType = a[dir].percentage !== null ? 'percentage' : 'price';
    const targetValue = a[dir].percentage !== null ? `${a[dir].percentage}%` : `$${a[dir].price}`;
    
    showToast(`✅ ${dir === 'up' ? 'Upper' : 'Lower'} alert ${action} for ${a.symbol.slice(0, -4)} at ${targetValue}`, "up");
  } else {
    showToast("⚠️ Please enter price or percentage first", "down");
  }
  saveAlertsToStorage();
}

// Function to change time frame
function changeTimeFrame(newTimeFrame) {
  timeFrame = newTimeFrame;
  showToast(`✅ Time frame changed to ${getTimeFrameLabel(newTimeFrame)}`, "up");
  
  // Update all price change displays
  updateAllPriceChanges();
  
  // Update active button state
  updateTimeFrameButtons();
}

function getTimeFrameLabel(timeFrame) {
  const labels = {
    '1h': '1 Hour',
    '4h': '4 Hours',
    '24h': '24 Hours',
    '7d': '7 Days',
    '30d': '30 Days'
  };
  return labels[timeFrame] || '24 Hours';
}

function updateTimeFrameButtons() {
  const buttons = document.querySelectorAll('.time-frame-btn');
  buttons.forEach(btn => {
    if (btn.dataset.timeframe === timeFrame) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function playAudioRepeatedly() {
  const audio = document.getElementById("alert-sound");
  if (repeatAudio) return;
  repeatAudio = setInterval(() => {
    audio.currentTime = 0;
    audio.play();
  }, 3000);
}

function stopRepeatedAudio() {
  if (repeatAudio) {
    clearInterval(repeatAudio);
    repeatAudio = null;
    showToast("🛑 Repeated audio stopped", "down");
  }
}

async function checkAlerts() {
  try {
    const res = await fetch("https://api.binance.com/api/v3/ticker/price");
    const data = await res.json();
    const audio = document.getElementById("alert-sound");

    // Update all prices and check alerts
    for (const a of alerts) {
      const d = data.find(p => p.symbol === a.symbol);
      if (!d) continue;

      const current = parseFloat(d.price);
      const priceLabel = document.getElementById(`price-${a.symbol}`);
      const alertElement = document.getElementById(`alert-${a.id}`);
      
      if (priceLabel) {
        // Update current price with instant color change
        const prev = parseFloat(priceLabel.dataset.prev || current);
        priceLabel.dataset.prev = current;
        const formatted = current < 100 ? current.toFixed(5) : current.toFixed(2);
        priceLabel.textContent = `$${formatted}`;

        // Update color based on instant movement only
        priceLabel.classList.remove("up", "down");
        if (current > prev) {
          priceLabel.classList.add("up");
        } else if (current < prev) {
          priceLabel.classList.add("down");
        }

        priceLabel.classList.add("price-updated");
        setTimeout(() => priceLabel.classList.remove("price-updated"), 1000);
      }

      // Update price change data every 5 cycles (25 seconds)
      const updateCycle = Math.floor(Date.now() / 25000) % 5;
      if (updateCycle === 0) {
        await updatePriceChange(a.symbol);
        // Small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      ["up", "down"].forEach(dir => {
        let targetPrice = a[dir].price;
        let isPercentageAlert = false;
        
        // Calculate target price from percentage if percentage is set
        if (a[dir].percentage !== null && a[dir].percentage !== undefined) {
          targetPrice = calculatePriceByPercentage(current, a[dir].percentage, dir);
          isPercentageAlert = true;
        }
        
        const cond = dir === "up" ? current >= targetPrice : current <= targetPrice;
        
        if (a[dir].enabled && !a[dir].triggered && targetPrice !== null && cond) {
          a[dir].triggered = true;
          
          let alertMessage = `📢 ${a.symbol.slice(0, -4)} ${dir === "up" ? "rose" : "fell"} to $${current.toFixed(2)}`;
          if (isPercentageAlert) {
            alertMessage += ` (${a[dir].percentage}% ${dir === "up" ? "increase" : "decrease"})`;
          } else {
            alertMessage += ` - Target: $${targetPrice.toFixed(2)}`;
          }
          
          showToast(alertMessage, dir);
          
          // Start flashing
          if (alertElement) {
            if (flashingAlerts[a.id]) {
              clearInterval(flashingAlerts[a.id]);
            }
            
            const flashColor = dir === "up" ? "rgba(40, 167, 69, 0.3)" : "rgba(220, 53, 69, 0.3)";
            const originalColor = "rgba(255, 255, 255, 0.04)";
            
            let isFlashing = true;
            flashingAlerts[a.id] = setInterval(() => {
              if (isFlashing) {
                alertElement.style.backgroundColor = alertElement.style.backgroundColor === flashColor ? 
                  originalColor : flashColor;
              }
            }, 500);

            const stopFlashing = () => {
              if (flashingAlerts[a.id]) {
                clearInterval(flashingAlerts[a.id]);
                delete flashingAlerts[a.id];
                alertElement.style.backgroundColor = originalColor;
                alertElement.removeEventListener('mouseenter', stopFlashing);
              }
            };
            
            alertElement.addEventListener('mouseenter', stopFlashing);
          }

          if (a[dir].mode === "repeat") {
            playAudioRepeatedly();
          } else {
            audio.currentTime = 0;
            audio.play();
          }
        }
      });
    }
  } catch (e) {
    console.error("🚫 Error fetching prices:", e);
  }
}

function removeAlert(id) {
  const index = alerts.findIndex(a => a.id === id);
  if (index !== -1) {
    const symbol = alerts[index].symbol.slice(0, -4);
    alerts.splice(index, 1);
    const el = document.getElementById(`alert-${id}`);
    if (el) el.remove();
    showToast(`✅ Alert for ${symbol} removed`, "up");
    saveAlertsToStorage();
    
    // Stop flashing if active
    if (flashingAlerts[id]) {
      clearInterval(flashingAlerts[id]);
      delete flashingAlerts[id];
    }
  }
}

function saveAlertsToStorage() {
  localStorage.setItem("alerts", JSON.stringify(alerts));
  localStorage.setItem("timeFrame", timeFrame);
}

function loadAlertsFromStorage() {
  const saved = localStorage.getItem("alerts");
  const savedTimeFrame = localStorage.getItem("timeFrame");
  
  if (savedTimeFrame) {
    timeFrame = savedTimeFrame;
  }

  if (!saved) return;

  const parsed = JSON.parse(saved);

  parsed.forEach(alert => {
    // Reset trigger states
    alert.up.triggered = false;
    alert.down.triggered = false;

    // Ensure percentage property exists for old alerts
    if (alert.up.percentage === undefined) alert.up.percentage = null;
    if (alert.down.percentage === undefined) alert.down.percentage = null;

    alerts.push(alert);
    renderAlert(alert);

    ["up", "down"].forEach((dir, i) => {
      const section = alert[dir];

      // Activation button
      const btns = document.querySelectorAll(`#alert-${alert.id} .toggle-btn`);
      const btn = btns[i];
      if (section.enabled && btn) {
        btn.textContent = "🔔 Active";
        btn.classList.add("active");
      }

      // Price in fields
      const priceInputs = document.querySelectorAll(`#alert-${alert.id} .target-input`);
      const priceInput = priceInputs[i];
      if (priceInput && section.price !== null) {
        priceInput.value = section.price;
      }

      // Percentage in fields
      const percentageInputs = document.querySelectorAll(`#alert-${alert.id} .percentage-input`);
      const percentageInput = percentageInputs[i];
      if (percentageInput && section.percentage !== null) {
        percentageInput.value = section.percentage;
      }

      // Repeat mode
      const selects = document.querySelectorAll(`#alert-${alert.id} select`);
      const select = selects[i];
      if (select) {
        select.value = section.mode || "once";
      }
    });
  });
}

// Function to update price change for all symbols
async function updateAllPriceChanges() {
  for (const alert of alerts) {
    await updatePriceChange(alert.symbol);
    // Small delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

// Function to load popular symbols automatically
function loadPopularSymbols() {
  const popularSymbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'XRPUSDT', 'DOTUSDT', 'LTCUSDT', 'LINKUSDT', 'BCHUSDT', 'XLMUSDT'];
  
  // Load popular symbols only if there are no saved alerts
  const saved = localStorage.getItem("alerts");
  if (!saved && alerts.length === 0) {
    popularSymbols.forEach(symbol => {
      const alert = {
        id: Date.now() + Math.random(),
        symbol,
        up: { price: null, percentage: null, enabled: false, triggered: false, mode: "once" },
        down: { price: null, percentage: null, enabled: false, triggered: false, mode: "once" }
      };
      alerts.push(alert);
      renderAlert(alert);
    });
    saveAlertsToStorage();
  }
}

// Add time frame selector to the interface
function addTimeFrameSelector() {
  const timeFrameContainer = document.createElement("div");
  timeFrameContainer.className = "time-frame-selector";
  timeFrameContainer.innerHTML = `
    <div class="time-frame-buttons">
      <button class="time-frame-btn active" data-timeframe="1h" onclick="changeTimeFrame('1h')">1H</button>
      <button class="time-frame-btn" data-timeframe="4h" onclick="changeTimeFrame('4h')">4H</button>
      <button class="time-frame-btn" data-timeframe="24h" onclick="changeTimeFrame('24h')">24H</button>
      <button class="time-frame-btn" data-timeframe="7d" onclick="changeTimeFrame('7d')">7D</button>
      <button class="time-frame-btn" data-timeframe="30d" onclick="changeTimeFrame('30d')">30D</button>
    </div>
  `;
  
  const controls = document.querySelector(".controls");
  controls.parentNode.insertBefore(timeFrameContainer, controls);
}

// Add Enter key support for input
document.getElementById("symbol-input").addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    addAlert();
  }
});

// DOM events
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById("add-btn").addEventListener("click", addAlert);
  document.getElementById("stop-audio-btn").addEventListener("click", stopRepeatedAudio);
  
  // Add time frame selector
  addTimeFrameSelector();
  
  // Load saved data
  loadAlertsFromStorage();
  
  // Update time frame buttons
  updateTimeFrameButtons();
  
  // Load popular symbols if no data exists
  setTimeout(loadPopularSymbols, 1000);
  
  // Update price change data after page load
  setTimeout(updateAllPriceChanges, 2000);
  
  // Start checking alerts
  setInterval(checkAlerts, 5000);
  
  // Initial data update
  checkAlerts();
});

// Function to clear all alerts
function clearAllAlerts() {
  if (alerts.length === 0) {
    showToast("⚠️ No alerts to clear", "down");
    return;
  }
  
  if (confirm("Are you sure you want to clear all alerts?")) {
    alerts.length = 0;
    document.getElementById("alerts-list").innerHTML = '';
    localStorage.removeItem("alerts");
    
    // Stop all flashing
    Object.keys(flashingAlerts).forEach(id => {
      clearInterval(flashingAlerts[id]);
    });
    flashingAlerts = {};
    
    showToast("✅ All alerts cleared", "up");
  }
}

// Add clear all button to interface
document.addEventListener('DOMContentLoaded', function() {
  const clearButton = document.createElement("button");
  clearButton.textContent = "🗑️ Clear All";
  clearButton.id = "clear-all-btn";
  clearButton.addEventListener("click", clearAllAlerts);
  
  const controls = document.querySelector(".controls");
  controls.appendChild(clearButton);
});

// Export functions for global access
window.removeAlert = removeAlert;
window.updateTarget = updateTarget;
window.setMode = setMode;
window.toggleAlert = toggleAlert;
window.changeTimeFrame = changeTimeFrame;