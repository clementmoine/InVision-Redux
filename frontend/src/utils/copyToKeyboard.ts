import { toast } from 'sonner';

import { getStaticUrl } from '@/utils'

export const copyImageToClipboard = async (imageUrl?: string) => {
  if (!imageUrl) {
    toast('No image URL', {
      description: 'No image URL was provided.',
      duration: 1500,
    });
    return false;
  }

  if (!navigator.clipboard || !('write' in navigator.clipboard)) {
    toast('Clipboard API not supported', {
      description: 'Your browser does not support copying to the clipboard.',
      duration: 1500,
    });
    return false;
  }

  try {
    const imageResponse = await fetch(getStaticUrl(imageUrl));
    const imageBlob = await imageResponse.blob();

    // Check if the image size exceeds a reasonable limit (5 MB in this case)
    if (imageBlob.size > 5 * 1024 * 1024) {
      toast('Image too large', {
        description: 'The image is too large to copy to the clipboard.',
        duration: 1500,
      });
      return false;
    }

    // Copy the Blob (image data) to the clipboard
    await navigator.clipboard.write([
      new ClipboardItem({
        [imageBlob.type]: imageBlob,
      }),
    ]);

    // Notify the user of success
    toast('Copied! 🎉', {
      description: 'Image copied to clipboard successfully.',
      duration: 1500,
    });

    return true;
  } catch (err) {
    console.error('Failed to copy image:', err);

    // Notify the user of failure
    toast('Failed to copy 😔', {
      description: 'An error occurred while copying the image.',
      duration: 1500,
    });

    return false;
  }
};

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
