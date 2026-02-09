import { strings } from "./strings";
import { useLanguage } from "./LanguageContext";

export function useTranslation() {
  const { language } = useLanguage();
  return strings[language];
}
