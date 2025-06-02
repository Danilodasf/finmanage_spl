import { Invoice, invoiceRepository, InvoiceStatus } from '../models/Invoice';

class InvoiceController {
  /**
   * Retorna todas as notas fiscais
   */
  public getInvoices(): Invoice[] {
    return invoiceRepository.findAll();
  }

  /**
   * Retorna notas fiscais de um negócio
   */
  public getInvoicesByBusinessId(businessId: string): Invoice[] {
    return invoiceRepository.findByBusinessId(businessId);
  }

  /**
   * Retorna uma nota fiscal pelo ID
   */
  public getInvoiceById(id: string): Invoice | undefined {
    return invoiceRepository.findById(id);
  }

  /**
   * Cria uma nova nota fiscal
   */
  public createInvoice(invoiceData: Omit<Invoice, 'id' | 'number'>): Invoice {
    // Gera o número da nota fiscal
    const invoiceNumber = invoiceRepository.generateInvoiceNumber(invoiceData.businessId);
    
    // Cria a nota fiscal
    return invoiceRepository.create({
      ...invoiceData,
      number: invoiceNumber
    });
  }

  /**
   * Atualiza uma nota fiscal existente
   */
  public updateInvoice(id: string, invoiceData: Partial<Invoice>): Invoice | undefined {
    return invoiceRepository.update(id, invoiceData);
  }

  /**
   * Remove uma nota fiscal
   */
  public deleteInvoice(id: string): boolean {
    return invoiceRepository.delete(id);
  }

  /**
   * Emite uma nota fiscal (muda o status para ISSUED)
   */
  public issueInvoice(id: string): Invoice | undefined {
    const invoice = this.getInvoiceById(id);
    if (!invoice) return undefined;
    
    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new Error('Apenas notas em rascunho podem ser emitidas');
    }
    
    return this.updateInvoice(id, { status: InvoiceStatus.ISSUED });
  }

  /**
   * Marca uma nota fiscal como paga
   */
  public markAsPaid(id: string): Invoice | undefined {
    const invoice = this.getInvoiceById(id);
    if (!invoice) return undefined;
    
    if (invoice.status !== InvoiceStatus.ISSUED) {
      throw new Error('Apenas notas emitidas podem ser marcadas como pagas');
    }
    
    return this.updateInvoice(id, { status: InvoiceStatus.PAID });
  }

  /**
   * Cancela uma nota fiscal
   */
  public cancelInvoice(id: string): Invoice | undefined {
    const invoice = this.getInvoiceById(id);
    if (!invoice) return undefined;
    
    if (invoice.status === InvoiceStatus.PAID) {
      throw new Error('Notas pagas não podem ser canceladas');
    }
    
    return this.updateInvoice(id, { status: InvoiceStatus.CANCELED });
  }

  /**
   * Calcula o total de receitas por período
   */
  public calculateRevenue(businessId: string, startDate: Date, endDate: Date): number {
    const invoices = this.getInvoicesByBusinessId(businessId);
    
    return invoices
      .filter(invoice => {
        const issueDate = new Date(invoice.issueDate);
        return (
          invoice.status === InvoiceStatus.PAID &&
          issueDate >= startDate &&
          issueDate <= endDate
        );
      })
      .reduce((total, invoice) => total + invoice.amount, 0);
  }
}

export const invoiceController = new InvoiceController(); 