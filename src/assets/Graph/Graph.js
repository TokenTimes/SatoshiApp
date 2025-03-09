// Graph.jsx
import React from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import TradingViewWidget from './TradingViewWidget';

const Graph = ({symbol}) => {
  return (
    <View style={styles.graphContainer}>
      <TradingViewWidget symbol={symbol} />
    </View>
  );
};

const styles = StyleSheet.create({
  graphContainer: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 10,
  },
});

export default Graph;
