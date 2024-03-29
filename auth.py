from utils import color_print

def login_classic(email, password, session):
    url = 'https://login.invisionapp.com/login-api/api/v2/login'
    data = {'deviceID': 'App', 'email': email, 'password': password}

    response = session.post(url=url, json=data)

    if response.status_code == 200:
        session.cookies.update(response.cookies)

        return session.cookies.get_dict()
    else:
        color_print(f"Classic authentication failed: {response.text}", "red")

        return None


def login_api(email, password, session):
    url = 'https://projects.invisionapp.com/api/account/login'
    data = {'email': email, 'password': password, "webview": 'false'}
    headers = {'x-xsrf-token': session.cookies.get('XSRF-TOKEN')}

    response = session.post(url=url, headers=headers, data=data)

    if response.status_code == 200:
        session.cookies.update(response.cookies)

        return session.cookies.get_dict()
    else:
        color_print("API authentication failed: {response.text}", "red")

        return None
