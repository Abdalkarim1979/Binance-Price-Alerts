# 📈 Binance Price Alerts - Real-time Cryptocurrency Monitoring

## 🚀 Features

### 🔔 Smart Alert System
- **Dual Alert Types**: Set both price-based and percentage-based alerts
- **Multiple Time Frames**: Monitor price changes across 1H, 4H, 24H, 7D, and 30D periods
- **Flexible Modes**: Choose between one-time alerts or repeating notifications
- **Visual Indicators**: Color-coded price movements and flashing alerts

## 🚀 Quick Start Guide

Follow these steps to run and use the **Advanced Market Analysis and Trading System**:

### 1. Clone or Download the Repository
```bash
git clone https://github.com/Abdalkarim1979/Binance-Price-Alerts.git
```
Or download the ZIP file directly from the [GitHub repository](https://github.com/Abdalkarim1979/Binance-Price-Alerts/archive/refs/heads/main.zip).

---

### 2. Open the Main File
- After extracting or cloning, locate the file:  
  ```
  index.html
  ```
- Open it with any modern browser (Chrome, Edge, Firefox).

---

### 3. Run the Application
1. Open `index.html` in any modern browser (Chrome, Firefox, Edge, Safari…).
2. The top 10 coins are automatically added on first launch.
3. Type a trading pair ending with USDT (example: SOLUSDT) → click ➕ or press Enter.
4. Inside each card:
   - Enter target price OR percentage
   - Choose mode (Once / Repeat)
   - Tap the bell button to activate the alert
5. When the target is hit → toast + sound + card flashes green/red.
   
### 💹 Advanced Monitoring
- **Real-time Updates**: Live price updates every 5 seconds
- **Multi-timeframe Analysis**: Track performance across different periods
- **Price Change Metrics**: Display both percentage and absolute value changes
- **Historical Comparison**: Compare current prices with historical data

### 🎨 Professional UI/UX
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Theme**: Eye-friendly dark interface optimized for trading
- **Interactive Cards**: Hover effects and smooth animations
- **Toast Notifications**: Non-intrusive alert notifications
- **Audio Alerts**: Customizable sound notifications

### ⚡ Technical Excellence
- **Local Storage**: Persist alerts and preferences across sessions
- **Rate Limit Handling**: Intelligent API call management
- **Error Resilience**: Graceful error handling and recovery
- **Performance Optimized**: Efficient data fetching and rendering

## 🎯 Demo

**Live Demo**:   
[binance-price-alerts](https://binance-price-alerts.vercel.app]).

### File Structure
```
binance-price-alerts/
├── index.html          # Main application file
├── style.css           # Comprehensive styling
├── script.js           # Core functionality
├── success.mp3         # Alert sound file
└── README.md           # Project documentation
```

## 📖 Usage

### Adding Symbols
1. Enter cryptocurrency symbol (e.g., `BTCUSDT`, `ETHUSDT`)
2. Click "Add Symbol" or press Enter
3. Popular symbols are auto-loaded on first visit

### Setting Alerts
#### Price-based Alerts
- Enter target price in "Upper Price" or "Lower Price" field
- Set alert mode (Once/Repeat)
- Activate with toggle button

#### Percentage-based Alerts
- Enter percentage change in "Percentage %" field
- System calculates target price automatically
- Perfect for relative price movements

### Time Frame Analysis
Use the time frame selector to monitor performance across:
- **1H**: Short-term movements
- **4H**: Intraday trends
- **24H**: Daily performance
- **7D**: Weekly trends
- **30D**: Monthly analysis

### Alert Management
- **Active Alerts**: Green "Active" badge with bell icon
- **Inactive Alerts**: Gray "Inactive" badge
- **Delete**: Click trash icon to remove symbol
- **Clear All**: Remove all alerts at once

## 🔧 API Integration

This project uses the official **Binance API**:

### Endpoints Used
- `GET /api/v3/ticker/price` - Current prices
- `GET /api/v3/ticker/24hr` - 24-hour statistics
- `GET /api/v3/klines` - Historical candlestick data

### Rate Limits
- Public endpoints: 1200 requests per minute
- Intelligent throttling implemented
- Efficient batch requests

## 🎨 Customization

### Adding Custom Sounds
Replace `success.mp3` with your preferred alert sound. Supported formats: MP3, WAV, OGG.

### Styling Modifications
Edit `style.css` to customize:
- Color scheme (`#f0b90b` for Binance yellow)
- Card dimensions and spacing
- Animation timings and effects
- Responsive breakpoints

### Feature Extensions
The modular codebase supports easy addition of:
- Additional exchanges
- Technical indicators
- Portfolio tracking
- Email/SMS notifications

## 📊 Performance

- **Load Time**: < 2 seconds
- **Update Interval**: 5 seconds
- **Memory Usage**: Optimized for long sessions
- **API Efficiency**: Minimal redundant calls

## 🔒 Privacy & Security

- No data sent to external servers except Binance API
- All data stored locally in browser
- No personal information collected
- Open source and transparent

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Binance** for providing reliable market data API
- **Contributors** who help improve this project
- **Users** for feedback and feature suggestions


If you need any further help or have any other questions I will be happy to help.
## Contact
  avrmicrotech@gmail.com
