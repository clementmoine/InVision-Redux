
import os
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
    print(color_code + text + Style.RESET_ALL)

def is_test_mode():
    return os.getenv('TEST_MODE', '').lower() in ['true', '1']
