import hashlib
import math
import random
import string
import time

HASH_BITS = 16
MAX_ATTEMPTS = 1_000_000

def birthday_bound(bits):
    return math.sqrt(2 * (2 ** bits) * math.log(2))

def truncated_hash(message, bits):
    digest = hashlib.sha256(message.encode("utf-8")).digest()
    value = int.from_bytes(digest, "big")
    return value >> (256 - bits)

def random_message(length=12):
    characters = string.ascii_letters + string.digits
    return "".join(random.choice(characters) for _ in range(length))

def show_hash(message, bits):
    value = truncated_hash(message, bits)
    width = (bits + 3) // 4
    return f"{value:0{width}x}"

def random_attack(bits):
    seen = {}
    start = time.perf_counter()

    for attempt in range(1, MAX_ATTEMPTS + 1):
        message = random_message()
        h = truncated_hash(message, bits)

        if h in seen and seen[h] != message:
            elapsed = time.perf_counter() - start
            return seen[h], message, h, attempt, elapsed

        seen[h] = message

    return None

def user_input_mode(bits):
    print("\nUSER INPUT MODE")
    print("Enter two different messages.")
    print("The program will calculate their truncated SHA-256 hashes.\n")

    message1 = input("Enter Message 1: ")
    message2 = input("Enter Message 2: ")

    if message1 == message2:
        print("\nBoth messages are identical.")
        print("For a collision, the messages must be different.")
        return

    hash1 = show_hash(message1, bits)
    hash2 = show_hash(message2, bits)

    print("\nRESULT")
    print("-" * 50)
    print(f"Message 1 : {message1}")
    print(f"Hash 1    : {hash1}")
    print(f"Message 2 : {message2}")
    print(f"Hash 2    : {hash2}")
    print("-" * 50)

    if hash1 == hash2:
        print("COLLISION FOUND!")
        print("The two different messages have the same truncated hash.")
    else:
        print("NO COLLISION")
        print("The two messages have different truncated hashes.")

    print("\nNote: This uses a deliberately reduced hash space.")
    print("It does NOT break full SHA-256.")

def random_mode(bits):
    print("\nRANDOM INPUT MODE")
    print("Generating random messages and searching for a collision...")
    print(f"Hash size: {bits} bits")
    print(f"Theoretical 50% birthday bound: {birthday_bound(bits):.2f} attempts")
    print("-" * 60)

    result = random_attack(bits)

    if result:
        message1, message2, collision_hash, attempts, elapsed = result
        width = (bits + 3) // 4

        print("COLLISION FOUND!")
        print("-" * 60)
        print(f"Message 1       : {message1}")
        print(f"Message 2       : {message2}")
        print(f"Common hash     : {collision_hash:0{width}x}")
        print(f"Attempts        : {attempts}")
        print(f"Time            : {elapsed:.6f} seconds")
        print("-" * 60)
    else:
        print("No collision found within the attempt limit.")

    print("Note: This is a controlled educational demonstration.")
    print("It does NOT demonstrate a collision in full SHA-256.")

def choose_hash_size():
    while True:
        print("\nSelect demonstration hash size:")
        print("1. 8 bits  - Very fast")
        print("2. 12 bits - Fast")
        print("3. 16 bits - Recommended for demonstration")
        print("4. 20 bits - Larger search")
        print("5. 24 bits - Larger search")

        choice = input("Enter your choice: ").strip()

        sizes = {
            "1": 8,
            "2": 12,
            "3": 16,
            "4": 20,
            "5": 24
        }

        if choice in sizes:
            return sizes[choice]

        print("Invalid choice. Please select 1-5.")

def main():
    print("=" * 60)
    print("     BIRTHDAY ATTACK - CRYPTOGRAPHIC HASH DEMO")
    print("=" * 60)
    print("Underlying hash function: SHA-256")
    print("The digest is intentionally truncated for demonstration.")

    while True:
        print("\nMAIN MENU")
        print("-" * 60)
        print("1. Random Input - Automatically search for collision")
        print("2. User Input   - Check collision between two messages")
        print("3. Change Hash Size")
        print("4. Exit")
        print("-" * 60)

        choice = input("Enter your choice: ").strip()

        if choice == "1":
            bits = choose_hash_size()
            random_mode(bits)

        elif choice == "2":
            bits = choose_hash_size()
            user_input_mode(bits)

        elif choice == "3":
            bits = choose_hash_size()
            print(f"\nHash size selected: {bits} bits")

        elif choice == "4":
            print("\nThank you for using the Birthday Attack Demo.")
            break

        else:
            print("\nInvalid choice. Please enter 1, 2, 3, or 4.")

if __name__ == "__main__":
    main()
