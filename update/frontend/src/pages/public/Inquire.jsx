import InquiryForm from '../../components/InquiryForm';

export default function Inquire() {
  return (
    <div className="min-h-screen pt-16 px-6 md:px-10 py-16 md:py-20 max-w-xl mx-auto">
      <h1 className="font-serif text-[clamp(32px,4vw,52px)] font-light mb-4">
        Get in <em>Touch</em>
      </h1>
      <p className="text-sm text-stone mb-12">
        Questions about a piece, a class, or a project — send us a note and we'll respond by email.
      </p>
      <InquiryForm defaultClassification="GENERAL_INFO" />
    </div>
  );
}
