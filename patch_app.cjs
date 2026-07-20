const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const generateRecurringInvoiceStr = `
  const handleGenerateRecurringInvoice = () => {
    const recurringProducts = savedProducts.filter(p => p.billingType === 'abonnement');
    if (recurringProducts.length === 0) return;
    
    setLines(recurringProducts.map((p, index) => ({
      id: 'line-' + Date.now() + index,
      description: p.description,
      quantity: 1,
      price: p.price,
      vatRate: p.vatRate,
      billingType: 'abonnement'
    })));
  };
`;

code = code.replace(
  /  const handleSelectProduct = \(product: Product\) => {/,
  generateRecurringInvoiceStr + '\n  const handleSelectProduct = (product: Product) => {'
);

code = code.replace(
  /onDeleteProduct={handleDeleteProduct}/,
  'onDeleteProduct={handleDeleteProduct}\n              onGenerateRecurringInvoice={handleGenerateRecurringInvoice}'
);

fs.writeFileSync('src/App.tsx', code);
