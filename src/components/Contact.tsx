import { useTranslation } from "../i18n/useTranslation";

export default function Contact() {
  const t = useTranslation();

  return (
    <section
      id="contact"
      className="w-full min-h-[60vh] pt-24 pb-20 flex justify-center items-center bg-white"
    >
      <div className="w-full max-w-4xl px-6 text-center">
        <h2 className="text-3xl font-bold mb-6">
          Contact
        </h2>

        

         <h2 className="text-3xl font-bold mb-12">
            {t.contact.description}
        </h2>

        <div className="flex flex-col items-center gap-5">
          <a
            href="mailto:dann.santlar@gmail.com"
            className="w-64 px-6 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
          >
            Email
          </a>

          <a
            href="https://www.linkedin.com/in/narciso-santiago/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-64 px-6 py-3 rounded-lg border border-purple-600 text-purple-600 hover:bg-purple-50 transition-colors"
          >
            LinkedIn
          </a>

          <a
            href="https://github.com/DannSant"
            target="_blank"
            rel="noopener noreferrer"
            className="w-64 px-6 py-3 rounded-lg border border-gray-800 text-gray-800 hover:bg-gray-100 transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
