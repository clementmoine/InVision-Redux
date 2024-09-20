import { toast } from 'sonner';

export const copyToClipboard = async (text?: string) => {
  if (!text) return false;

  if (navigator.clipboard) {
    // Use Clipboard API if available
    try {
      await navigator.clipboard.writeText(text);
      toast('Copied! 🎉', {
        description: 'Text copied to clipboard successfully.',
        duration: 1500,
      });
      return true;
    } catch (err) {
      console.error('Failed to copy text to clipboard:', err);
      return false;
    }
  } else {
    // Fallback for old browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;

    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    textArea.style.opacity = '0';

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);

      if (successful) {
        toast('Copied! 🎉', {
          description: 'Text copied to clipboard successfully.',
          duration: 1500,
        });
      }
      return successful;
    } catch (err) {
      console.error('Failed to copy text using execCommand:', err);
      document.body.removeChild(textArea);
      return false;
    }
  }
};
