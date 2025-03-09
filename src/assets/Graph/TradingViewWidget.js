// TradingViewWidget.jsx
import React, {memo} from 'react';
import {StyleSheet, View, ActivityIndicator, Dimensions} from 'react-native';
import {WebView} from 'react-native-webview';
import {useSelector} from 'react-redux';

function TradingViewWidget({symbol = 'MEXC:BTCUSDT'}) {
  const isDarkMode = useSelector(state => state.global.isDarkMode);
  const screenWidth = Dimensions.get('window').width;

  // Create HTML content for WebView
  const generateHTML = () => {
    // Smaller fixed size for mobile
    const height = 280;
    const width = screenWidth - 60; // More padding for narrower width
    const theme = isDarkMode ? 'dark' : 'light';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { margin: 0; padding: 0; }
            .tradingview-widget-container { height: 100%; width: 100%; }
          </style>
        </head>
        <body>
          <div class="tradingview-widget-container">
            <div id="tradingview_widget"></div>
            <div class="tradingview-widget-copyright">
              <a href="https://www.tradingview.com/" rel="noopener" target="_blank">
              </a>
            </div>
          </div>
          <script type="text/javascript" src="https://s3.tradingview.com/tv.js"></script>
          <script type="text/javascript">
            new TradingView.widget({
              "autosize": false,
              "width": ${width},
              "height": ${height},
              "symbol": "${symbol}",
              "interval": "D",
              "timezone": "Etc/UTC",
              "theme": "${theme}",
              "style": "1",
              "locale": "en",
              "allow_symbol_change": true,
              "calendar": false,
              "container_id": "tradingview_widget"
            });
          </script>
        </body>
      </html>
    `;
  };

  return (
    <View style={styles.container}>
      <WebView
        source={{html: generateHTML()}}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        )}
        onError={syntheticEvent => {
          const {nativeEvent} = syntheticEvent;
          console.error('WebView error:', nativeEvent);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 280, // Smaller fixed height for mobile
    borderRadius: 8,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default memo(TradingViewWidget);
