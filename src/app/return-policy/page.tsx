export default function ReturnPolicyPage() {
  return (
    <main className="min-h-screen bg-[#080808] text-[#EDE9E0] pt-36 pb-20 px-6 md:pt-40">
      <div className="mx-auto max-w-4xl space-y-12">
        <header className="space-y-4">
          <h1 className="font-anton text-4xl uppercase tracking-[0.1em] text-[#EDE9E0]">
            Refunds Policy
          </h1>
          <p className="text-sm tracking-widest text-[#555555]">
            Last updated: May 16, 2026
          </p>
        </header>

        <section className="space-y-6 text-sm leading-relaxed text-[#A0A0A0]">
          <p>
            At QUTB, we strive to ensure you are completely satisfied with your purchase. 
            If you need to return an item, please read our refunds policy below.
          </p>
          
          <h2 className="font-anton text-xl tracking-wider text-[#EDE9E0]">Returns</h2>
          <p>
            You have 14 days from the date of delivery to initiate a return. To be eligible for a return, your item must be unused, unwashed, and in the same condition that you received it. It must also be in the original packaging with all tags attached.
          </p>

          <h2 className="font-anton text-xl tracking-wider text-[#EDE9E0]">Refunds</h2>
          <p>
            Once your return is received and inspected, we will send you an email to notify you that we have received your returned item. We will also notify you of the approval or rejection of your refund.
          </p>
          <p>
            If your return is approved, your refund will be processed, and a credit will automatically be applied to your original method of payment within a certain amount of days. For Cash on Delivery (COD) orders, we will contact you to arrange an alternative refund method.
          </p>

          <h2 className="font-anton text-xl tracking-wider text-[#EDE9E0]">Exchanges</h2>
          <p>
            We only replace items if they are defective or damaged. If you need to exchange it for the same item or a different size, please contact us at <a href="mailto:hello@qutb.studio" className="text-[#EDE9E0] underline hover:text-white">hello@qutb.studio</a>.
          </p>

          <h2 className="font-anton text-xl tracking-wider text-[#EDE9E0]">Shipping Returns</h2>
          <p>
            To return your product, please contact our support team. You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable. If you receive a refund, the cost of return shipping will be deducted from your refund.
          </p>
        </section>
      </div>
    </main>
  );
}
