import { View, Text } from '@react-pdf/renderer';
import { styles } from './InvoicePDFStyles';
import type { Invoice } from '@/types/invoice';
import { formatCurrency, formatQuantity } from '@/services/pdf.service';

interface InvoicePDFLineItemsProps {
  invoice: Invoice;
}

export function InvoicePDFLineItems({ invoice }: InvoicePDFLineItemsProps) {
  const lineItems = invoice.line_items || [];
  
  // Don't render if no line items
  if (lineItems.length === 0) {
    return (
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.colSNo]}>#</Text>
          <Text style={[styles.tableHeaderCell, styles.colDescWide]}>Description</Text>
          <Text style={[styles.tableHeaderCell, styles.colHSN]}>HSN/SAC</Text>
          <Text style={[styles.tableHeaderCell, styles.colAmountWide]}>Amount</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, { textAlign: 'center', width: '100%' }]}>No items</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.table}>
      {/* Simplified Table Header - matching sample template */}
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderCell, styles.colSNo]}>#</Text>
        <Text style={[styles.tableHeaderCell, styles.colDescWide]}>Description</Text>
        <Text style={[styles.tableHeaderCell, styles.colHSN]}>HSN/SAC</Text>
        <Text style={[styles.tableHeaderCell, styles.colAmountWide]}>Amount</Text>
      </View>

      {/* Table Rows - simplified layout */}
      {lineItems.map((item, index) => (
        <View
          key={item.id || index}
          style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
          wrap={false}
        >
          <Text style={[styles.tableCell, styles.colSNo]}>{index + 1}</Text>
          <Text style={[styles.tableCell, styles.colDescWide]}>{item.description || 'Item'}</Text>
          <Text style={[styles.tableCell, styles.colHSN]}>{item.hsn_sac_code || '-'}</Text>
          <Text style={[styles.tableCellBold, styles.colAmountWide]}>
            {formatCurrency(item.amount || 0)}
          </Text>
        </View>
      ))}
    </View>
  );
}
