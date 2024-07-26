import { Toast } from '@/components/ui/use-toast';

type ToastFunc = (options: Toast) => void;

export const copyToClipboard = async (text?: string, toast?: ToastFunc) => {
  if (!text) return false; // Retourner false si aucun texte n'est fourni

  if (navigator.clipboard) {
    // Utilisation de l'API Clipboard si disponible
    try {
      await navigator.clipboard.writeText(text);
      toast?.({
        title: 'Copied! 🎉',
        description: 'Text copied to clipboard successfully.',
        className: '!top-0 !left-0 !bottom-auto !right-auto',
      });
      return true;
    } catch (err) {
      console.error('Failed to copy text to clipboard:', err);
      return false;
    }
  } else {
    // Fallback pour les navigateurs plus anciens
    const textArea = document.createElement('textarea');
    textArea.value = text;

    // Assurer que l'élément n'est pas visible à l'écran
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    textArea.style.opacity = '0';

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea); // Nettoyer l'élément du DOM

      if (successful) {
        toast?.({
          title: 'Copied! 🎉',
          description: 'Text copied to clipboard successfully.',
          className: '!top-0 !left-0 !bottom-auto !right-auto',
        });
      }
      return successful;
    } catch (err) {
      console.error('Failed to copy text using execCommand:', err);
      document.body.removeChild(textArea); // Nettoyer l'élément du DOM
      return false;
    }
  }
};
