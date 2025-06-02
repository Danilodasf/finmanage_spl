export enum InvoiceStatus {
  DRAFT = 'draft',
  ISSUED = 'issued',
  PAID = 'paid',
  CANCELED = 'canceled'
}

export interface Invoice {
  id: string;
  businessId: string;
  number: string;
  clientName: string;
  clientDocument: string; // CPF ou CNPJ
  issueDate: Date;
  dueDate: Date;
  amount: number;
  description: string;
  status: InvoiceStatus;
}

// Simulação de repositório em memória
class InvoiceRepository {
  private invoices: Invoice[] = [];

  public findAll(): Invoice[] {
    return this.invoices;
  }

  public findByBusinessId(businessId: string): Invoice[] {
    return this.invoices.filter(invoice => invoice.businessId === businessId);
  }

  public findById(id: string): Invoice | undefined {
    return this.invoices.find(invoice => invoice.id === id);
  }

  public create(invoice: Omit<Invoice, 'id'>): Invoice {
    const newInvoice = {
      ...invoice,
      id: Math.random().toString(36).substring(2, 9)
    };
    this.invoices.push(newInvoice);
    return newInvoice;
  }

  public update(id: string, invoiceData: Partial<Invoice>): Invoice | undefined {
    const index = this.invoices.findIndex(invoice => invoice.id === id);
    if (index === -1) return undefined;
    
    this.invoices[index] = { ...this.invoices[index], ...invoiceData };
    return this.invoices[index];
  }

  public delete(id: string): boolean {
    const index = this.invoices.findIndex(invoice => invoice.id === id);
    if (index === -1) return false;
    
    this.invoices.splice(index, 1);
    return true;
  }

  // Método para gerar um número sequencial para a nota fiscal
  public generateInvoiceNumber(businessId: string): string {
    const businessInvoices = this.findByBusinessId(businessId);
    const nextNumber = businessInvoices.length + 1;
    return `NF-${businessId.substring(0, 4)}-${nextNumber.toString().padStart(5, '0')}`;
  }
}

export const invoiceRepository = new InvoiceRepository(); 