import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {ChevronUp, ChevronDown} from 'lucide-react-native';
import {useSelector} from 'react-redux';

// Helper functions (kept the same)
const formatIsError = x => {
  if (x === '1') {
    return 'Failed';
  }
  return 'Success';
};

const formatPrice = value => {
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return 'N/A';

  if (numValue >= 1) {
    return `$${numValue.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  } else {
    const absValue = Math.abs(numValue);
    const decimals = Math.max(4 - (Math.floor(Math.log10(absValue)) + 1), 0);
    return `$${numValue.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  }
};

const formatNumber = (num, decimals = 0, sign = '', percentage = '') => {
  if (num === null || num === undefined || isNaN(num)) return 'N/A';

  if (Math.abs(num) >= 1e16) {
    return `${sign}${Number(num).toExponential(2)}${percentage}`.trim();
  }

  if (Math.abs(num) >= 1e9) {
    const formatted = (num / 1e9).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${sign}${formatted}B${percentage}`.trim();
  }

  if (Math.abs(num) >= 1e6) {
    const formatted = (num / 1e6).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${sign}${formatted}M${percentage}`.trim();
  }

  if (Math.abs(num) >= 1e3) {
    const formatted = (num / 1e3).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${sign}${formatted}K${percentage}`.trim();
  }

  if (Math.abs(num) < 1 && Math.abs(num) > 0) {
    return `${sign}${num.toLocaleString(undefined, {
      minimumFractionDigits: 6,
      maximumFractionDigits: 6,
    })}${percentage}`.trim();
  }

  return `${sign}${num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}${percentage}`.trim();
};

// Format cell values
const formatCellValue = (value, colName, isDarkMode, format) => {
  if (value === null || value === undefined) return 'N/A';

  switch (colName) {
    case 'valueDisplay': {
      const numValue = parseFloat(value.replace(/[^0-9.e+-]/g, ''));
      if (!isNaN(numValue)) {
        return formatNumber(numValue);
      }
      return value;
    }

    case 'isError':
      return {
        formattedValue: formatIsError(value),
        style:
          value === 0 || value === '0'
            ? isDarkMode
              ? styles.successTextDark
              : styles.successText
            : isDarkMode
            ? styles.errorTextDark
            : styles.errorText,
      };

    case 'price':
      if (format) {
        return value;
      } else {
        return formatPrice(value);
      }

    case 'market_cap':
    case 'volume_24h':
      if (format) {
        return `$${value}`;
      } else {
        return formatNumber(value, 0, '$', '');
      }

    case 'balance_formatted':
      return formatNumber(value, 0, '', '');

    case 'percentage_relative_to_total_supply':
      return formatNumber(value, 0, '', '%');

    case 'percent_change_24h':
    case 'percent_change_7d':
    case 'percent_change_30d':
    case 'percent_change_90d':
      return {
        formattedValue: `${value > 0 ? '+' : ''}${value.toLocaleString(
          undefined,
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          },
        )}%`,
        style:
          value > 0
            ? isDarkMode
              ? styles.positiveTextDark
              : styles.positiveText
            : isDarkMode
            ? styles.negativeTextDark
            : styles.negativeText,
      };

    default:
      return typeof value === 'number'
        ? value.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })
        : value.toString();
  }
};

// Compact Filter Components
const BooleanFilter = ({filter, value, onChange}) => {
  const isDarkMode = useSelector(state => state.global.isDarkMode);

  return (
    <View
      style={[styles.filterBlock, isDarkMode ? styles.filterBlockDark : null]}>
      <Text
        style={[
          styles.filterLabel,
          isDarkMode ? styles.filterLabelDark : null,
        ]}>
        {filter.filter_name}
      </Text>
      <View style={styles.filterSelectContainer}>
        <TouchableOpacity
          style={[
            styles.filterOption,
            value === '' ? styles.filterOptionSelected : null,
            isDarkMode ? styles.filterOptionDark : null,
            value === '' && isDarkMode ? styles.filterOptionSelectedDark : null,
          ]}
          onPress={() => onChange('')}>
          <Text
            style={[
              styles.filterOptionText,
              isDarkMode ? styles.filterOptionTextDark : null,
            ]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterOption,
            value === '0' ? styles.filterOptionSelected : null,
            isDarkMode ? styles.filterOptionDark : null,
            value === '0' && isDarkMode
              ? styles.filterOptionSelectedDark
              : null,
          ]}
          onPress={() => onChange('0')}>
          <Text
            style={[
              styles.filterOptionText,
              isDarkMode ? styles.filterOptionTextDark : null,
            ]}>
            Success
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterOption,
            value === '1' ? styles.filterOptionSelected : null,
            isDarkMode ? styles.filterOptionDark : null,
            value === '1' && isDarkMode
              ? styles.filterOptionSelectedDark
              : null,
          ]}
          onPress={() => onChange('1')}>
          <Text
            style={[
              styles.filterOptionText,
              isDarkMode ? styles.filterOptionTextDark : null,
            ]}>
            Failed
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const NumberFilter = ({filter, value, onChange}) => {
  const isDarkMode = useSelector(state => state.global.isDarkMode);

  // Determine step based on filter name
  let step = 1;
  switch (filter.name) {
    case 'price':
      step = 0.000001;
      break;
    case 'percent_change_24h':
      step = 0.1;
      break;
    default:
      step = 1;
  }

  const handleIncrement = () => {
    const currentValue = parseFloat(value) || 0;
    const newValue = Math.round((currentValue + step) * 1e6) / 1e6;
    onChange(newValue.toString());
  };

  const handleDecrement = () => {
    const currentValue = parseFloat(value) || 0;
    const newValue = Math.max(0, Math.round((currentValue - step) * 1e6) / 1e6);
    onChange(newValue.toString());
  };

  return (
    <View
      style={[styles.filterBlock, isDarkMode ? styles.filterBlockDark : null]}>
      <Text
        style={[
          styles.filterLabel,
          isDarkMode ? styles.filterLabelDark : null,
        ]}>
        {filter.filter_name}
      </Text>
      <View style={styles.numberFilterRow}>
        <TouchableOpacity
          onPress={handleDecrement}
          style={[
            styles.numberFilterBtn,
            isDarkMode ? styles.numberFilterBtnDark : null,
          ]}>
          <Text style={styles.btnText}>-</Text>
        </TouchableOpacity>
        <TextInput
          keyboardType="numeric"
          value={value || ''}
          onChangeText={rawVal => {
            if (rawVal === '' || /^-?\d*\.?\d*$/.test(rawVal)) {
              onChange(rawVal);
            }
          }}
          style={[
            styles.filterInput,
            isDarkMode ? styles.filterInputDark : null,
          ]}
          placeholder="0"
          placeholderTextColor={isDarkMode ? '#999' : '#ccc'}
        />
        <TouchableOpacity
          onPress={handleIncrement}
          style={[
            styles.numberFilterBtn,
            isDarkMode ? styles.numberFilterBtnDark : null,
          ]}>
          <Text style={styles.btnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Main TableCreator Component
const CompactTableCreator = ({data}) => {
  const {data: rows = [], columns = [], filters = []} = data || {};
  const isDarkMode = useSelector(state => state.global.isDarkMode);

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: null,
  });

  // Initialize filterValues to empty strings
  const [filterValues, setFilterValues] = useState(
    Object.fromEntries(filters.map(f => [f.name, ''])),
  );

  const handleSort = columnName => {
    setSortConfig(prev => ({
      key: columnName,
      direction:
        prev.key === columnName
          ? prev.direction === 'asc'
            ? 'desc'
            : 'asc'
          : 'asc',
    }));
  };

  const filteredAndSortedRows = useMemo(() => {
    // First filter
    let result = rows.filter(row =>
      filters.every(filter => {
        const filterVal = parseFloat(filterValues[filter.name]);
        if (isNaN(filterVal)) return true; // no filter applied

        const rowVal = row[filter.name];
        if (rowVal === null || rowVal === undefined) return false;

        // Decide step based on filter
        let step = 1;
        switch (filter.name) {
          case 'price':
            step = 0.000001;
            break;
          case 'percent_change_24h':
            step = 0.1;
            break;
          default:
            step = 1;
        }

        const precision = Math.max(0, Math.ceil(Math.log10(1 / step)));
        const roundedRowVal = Number(parseFloat(rowVal).toFixed(precision));
        const roundedFilterVal = Number(filterVal.toFixed(precision));

        return roundedRowVal >= roundedFilterVal;
      }),
    );

    // Then sort
    if (sortConfig.key) {
      result.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];

        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        // If strings, try numeric comparison or fallback to string compare
        if (typeof valA === 'string' && typeof valB === 'string') {
          return valA.localeCompare(valB, undefined, {numeric: true});
        }

        const numA = Number(valA);
        const numB = Number(valB);
        if (!isNaN(numA) && !isNaN(numB)) {
          return numA - numB;
        }

        // Fallback
        return String(valA).localeCompare(String(valB));
      });

      if (sortConfig.direction === 'desc') {
        result.reverse();
      }
    }
    return result;
  }, [rows, filters, filterValues, sortConfig]);

  // Get screen dimensions
  const screenWidth = Dimensions.get('window').width;

  return (
    <View style={styles.tableCreatorContainer}>
      {/* Filters (if needed) */}
      {filters.length > 0 && rows.length > 1 && (
        <View
          style={[
            styles.filtersWrapper,
            isDarkMode ? styles.filtersWrapperDark : null,
          ]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filtersRow}>
              {filters.map(filter =>
                filter.type === 'bool' ? (
                  <BooleanFilter
                    key={filter.name}
                    filter={filter}
                    value={filterValues[filter.name]}
                    onChange={value =>
                      setFilterValues(prev => ({...prev, [filter.name]: value}))
                    }
                  />
                ) : (
                  <NumberFilter
                    key={filter.name}
                    filter={filter}
                    value={filterValues[filter.name]}
                    onChange={value =>
                      setFilterValues(prev => ({...prev, [filter.name]: value}))
                    }
                  />
                ),
              )}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Compact Table */}
      <View
        style={[
          styles.tableContainer,
          isDarkMode ? styles.tableContainerDark : null,
        ]}>
        {/* Wrap the entire table content in a horizontal ScrollView */}
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={true}>
          <View>
            {/* Header Row - Fixed position to ensure alignment */}
            <View
              style={[
                styles.tableHeadRow,
                isDarkMode ? styles.tableHeadRowDark : null,
              ]}>
              {columns.map((col, colIndex) => {
                const isSorted = sortConfig.key === col.name;
                return (
                  <TouchableOpacity
                    key={col.name}
                    onPress={() =>
                      rows.length > 1 && col.sort && handleSort(col.name)
                    }
                    style={[
                      styles.tableHeadCell,
                      isDarkMode ? styles.tableHeadCellDark : null,
                      col.sort ? styles.sortable : null,
                      col.sort && isDarkMode ? styles.sortableDark : null,
                      // Calculate width based on column type or set default
                      {
                        width:
                          col.width || (col.name === 'address' ? 160 : 140),
                      },
                      // Add right border to all cells except the last one
                      colIndex < columns.length - 1
                        ? styles.cellBorderRight
                        : null,
                      colIndex < columns.length - 1 && isDarkMode
                        ? styles.cellBorderRightDark
                        : null,
                    ]}
                    disabled={!(rows.length > 1 && col.sort)}>
                    <View style={styles.headerCellContent}>
                      <Text
                        style={[
                          styles.headerText,
                          isDarkMode ? styles.headerTextDark : null,
                        ]}
                        numberOfLines={1}>
                        {col.table_name}
                      </Text>
                      {col.sort && (
                        <View style={styles.sortIcons}>
                          <ChevronUp
                            size={12}
                            color={
                              isSorted && sortConfig.direction === 'asc'
                                ? '#4a90e2'
                                : isDarkMode
                                ? '#777'
                                : '#ccc'
                            }
                          />
                          <ChevronDown
                            size={12}
                            color={
                              isSorted && sortConfig.direction === 'desc'
                                ? '#4a90e2'
                                : isDarkMode
                                ? '#777'
                                : '#ccc'
                            }
                          />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Vertically Scrollable Table Body */}
            <ScrollView style={styles.tableBody}>
              {filteredAndSortedRows.length === 0 ? (
                <View
                  style={[
                    styles.noResults,
                    isDarkMode ? styles.noResultsDark : null,
                  ]}>
                  <Text
                    style={[
                      styles.noResultsText,
                      isDarkMode ? styles.noResultsTextDark : null,
                    ]}>
                    No results found
                  </Text>
                </View>
              ) : (
                filteredAndSortedRows.map((row, rowIndex) => (
                  <View
                    key={rowIndex}
                    style={[
                      styles.tableBodyRow,
                      isDarkMode ? styles.tableBodyRowDark : null,
                      rowIndex % 2 === 0 ? styles.evenRow : null,
                      rowIndex % 2 === 0 && isDarkMode
                        ? styles.evenRowDark
                        : null,
                    ]}>
                    {columns.map((col, colIndex) => {
                      const cellValue = row[col.name];
                      const formatted = formatCellValue(
                        cellValue,
                        col.name,
                        isDarkMode,
                        col.formatted,
                      );

                      // Column width to match header
                      const cellWidth =
                        col.width || (col.name === 'address' ? 160 : 140);

                      // Check if formatted is an object with formattedValue and style
                      if (
                        formatted &&
                        typeof formatted === 'object' &&
                        'formattedValue' in formatted
                      ) {
                        return (
                          <View
                            key={col.name}
                            style={[
                              styles.tableCell,
                              isDarkMode ? styles.tableCellDark : null,
                              {width: cellWidth},
                              // Add right border to all cells except the last one
                              colIndex < columns.length - 1
                                ? styles.cellBorderRight
                                : null,
                              colIndex < columns.length - 1 && isDarkMode
                                ? styles.cellBorderRightDark
                                : null,
                            ]}>
                            <Text style={formatted.style} numberOfLines={1}>
                              {formatted.formattedValue}
                            </Text>
                          </View>
                        );
                      }

                      // Otherwise, it's just a string or number
                      return (
                        <View
                          key={col.name}
                          style={[
                            styles.tableCell,
                            isDarkMode ? styles.tableCellDark : null,
                            {width: cellWidth},
                            // Add right border to all cells except the last one
                            colIndex < columns.length - 1
                              ? styles.cellBorderRight
                              : null,
                            colIndex < columns.length - 1 && isDarkMode
                              ? styles.cellBorderRightDark
                              : null,
                          ]}>
                          <Text
                            style={[
                              styles.cellText,
                              isDarkMode ? styles.cellTextDark : null,
                            ]}
                            numberOfLines={1}
                            ellipsizeMode="middle">
                            {formatted}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

// Updated styles with more compact measurements and added column separators
const styles = StyleSheet.create({
  tableCreatorContainer: {
    flex: 1,
    width: '100%',
  },
  filtersWrapper: {
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    marginBottom: 8,
    padding: 8,
  },
  filtersWrapperDark: {
    backgroundColor: '#2d2d2d',
  },
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
  filterBlock: {
    minWidth: 120,
    marginRight: 8,
    marginBottom: 4,
    padding: 6,
    backgroundColor: '#fff',
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  filterBlockDark: {
    backgroundColor: '#333',
  },
  filterLabel: {
    fontWeight: '600',
    marginBottom: 4,
    fontSize: 11,
    color: '#555',
  },
  filterLabelDark: {
    color: '#ccc',
  },
  filterSelectContainer: {
    flexDirection: 'row',
    borderRadius: 4,
    overflow: 'hidden',
  },
  filterOption: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 2,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  filterOptionDark: {
    backgroundColor: '#444',
  },
  filterOptionSelected: {
    backgroundColor: '#4a90e2',
  },
  filterOptionSelectedDark: {
    backgroundColor: '#1a5ba8',
  },
  filterOptionText: {
    fontSize: 10,
    color: '#333',
  },
  filterOptionTextDark: {
    color: '#eee',
  },
  numberFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  numberFilterBtn: {
    width: 24,
    height: 24,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  numberFilterBtnDark: {
    backgroundColor: '#444',
  },
  btnText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  filterInput: {
    flex: 1,
    height: 24,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 6,
    marginHorizontal: 4,
    borderRadius: 4,
    fontSize: 11,
    textAlign: 'center',
  },
  filterInputDark: {
    backgroundColor: '#2a2a2a',
    color: '#fff',
  },
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: 6,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  tableContainerDark: {
    backgroundColor: '#222',
  },
  tableHeadRow: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    // Fixed position to ensure alignment
    position: 'sticky',
    top: 0,
    zIndex: 1,
  },
  tableHeadRowDark: {
    backgroundColor: '#333',
    borderBottomColor: '#444',
  },
  tableHeadCell: {
    padding: 8,
    minWidth: 60,
  },
  tableHeadCellDark: {
    borderRightColor: '#444',
  },
  headerCellContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Separate text and sort icons
  },
  headerText: {
    fontWeight: '600',
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    flex: 1, // Allow text to take available space
  },
  headerTextDark: {
    color: '#eee',
    textAlign: 'center',
  },
  sortIcons: {
    marginLeft: 2,
  },
  tableBody: {
    maxHeight: 250, // More compact height
  },
  tableBodyRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
  },
  tableBodyRowDark: {
    borderBottomColor: '#444',
  },
  evenRow: {
    backgroundColor: '#fafafa',
  },
  evenRowDark: {
    backgroundColor: '#2a2a2a',
  },
  tableCell: {
    padding: 8,
    minWidth: 60,
    justifyContent: 'center',
    textAlign: 'center',
  },
  tableCellDark: {},
  cellText: {
    fontSize: 11,
    color: '#333',
    textAlign: 'center',
  },
  cellTextDark: {
    color: '#ddd',
  },
  noResults: {
    padding: 12,
    alignItems: 'center',
  },
  noResultsDark: {},
  noResultsText: {
    color: '#888',
    fontStyle: 'italic',
    fontSize: 11,
  },
  noResultsTextDark: {
    color: '#aaa',
  },
  successText: {
    color: '#4caf50',
    fontSize: 11,
  },
  successTextDark: {
    color: '#81c784',
    fontSize: 11,
  },
  errorText: {
    color: '#f44336',
    fontSize: 11,
  },
  errorTextDark: {
    color: '#e57373',
    fontSize: 11,
  },
  positiveText: {
    color: '#4caf50',
    fontSize: 11,
  },
  positiveTextDark: {
    color: '#81c784',
    fontSize: 11,
  },
  negativeText: {
    color: '#f44336',
    fontSize: 11,
  },
  negativeTextDark: {
    color: '#e57373',
    fontSize: 11,
  },
  // New styles for column separators
  cellBorderRight: {
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  cellBorderRightDark: {
    borderRightColor: '#444',
  },
});

export default CompactTableCreator;
