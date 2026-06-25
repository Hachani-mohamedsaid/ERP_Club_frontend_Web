import { useLocale } from "../../contexts/LocaleContext";
import type { Locale } from "../../i18n/joueurTranslations";

export function JoueurLangToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <div
      className="flex rounded-xl border p-0.5"
      style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
    >
      {(["fr", "en"] as Locale[]).map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => setLocale(lang)}
          className="rounded-lg px-3 py-1 text-xs font-semibold uppercase transition-all active:scale-[0.98]"
          style={{
            background: locale === lang ? "#FF6B57" : "transparent",
            color: locale === lang ? "white" : "var(--text-muted)",
          }}
        >
          {lang}
        </button>
      ))}
    </div>
  );
}
