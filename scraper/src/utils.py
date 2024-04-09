
import os
from urllib.parse import urlparse
from colorama import Fore, Style

def color_print(text, color="RESET"):
    color_mapping = {
        "reset": Style.RESET_ALL,
        "black": Fore.BLACK,
        "red": Fore.RED,
        "green": Fore.GREEN,
        "yellow": Fore.YELLOW,
        "blue": Fore.BLUE,
        "magenta": Fore.MAGENTA,
        "cyan": Fore.CYAN,
        "white": Fore.WHITE,
    }
    color_code = color_mapping.get(color.lower(), Style.RESET_ALL)
    return print(color_code + text + Style.RESET_ALL)

def color_input(text, color="RESET"):
    color_mapping = {
        "reset": Style.RESET_ALL,
        "black": Fore.BLACK,
        "red": Fore.RED,
        "green": Fore.GREEN,
        "yellow": Fore.YELLOW,
        "blue": Fore.BLUE,
        "magenta": Fore.MAGENTA,
        "cyan": Fore.CYAN,
        "white": Fore.WHITE,
    }
    color_code = color_mapping.get(color.lower(), Style.RESET_ALL)
    return input(color_code + text + Style.RESET_ALL)

def is_test_mode():
    return os.getenv('TEST_MODE', '').lower() in ['true', '1']

def is_link(text):
    """
    Check if a given text is a valid link.

    Args:
        text (str): The text to check.

    Returns:
        bool: True if the text is a valid link, False otherwise.
    """
    # Trim the string to remove leading and trailing spaces
    text = text.strip()
    
    # Check if the string contains only a link
    parsed_url = urlparse(text)
    if parsed_url.scheme and parsed_url.netloc:
        # If the scheme and netloc are present, it's likely a valid link
        return True
    else:
        return False