import smtplib

def send_email(email, product, price):

    message = f"""
    Subject: Price Drop Alert!

    Good news!

    {product} dropped to {price}

    Buy now before price increases!
    """

    server = smtplib.SMTP("smtp.gmail.com", 587)
    server.starttls()

    server.login("your_email@gmail.com", "app_password")

    server.sendmail(
        "your_email@gmail.com",
        email,
        message
    )

    server.quit()