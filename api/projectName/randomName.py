import random
import base64

random.seed()


def randomName():
    # Generate a random pattern of 12 digits
    n = random.randrange(2**17, 2**19) * 1000000 + \
        random.randrange(2**17, 2**19)
    return base64.b64encode(str(n).encode("utf-8")).decode()


if __name__ == '__main__':
    for i in range(20):
        name = randomName()
        # For this application we don't need to get the number back,
        # but if we did, something like this will do it.
        print(name, int(base64.b64decode(name).decode()))
