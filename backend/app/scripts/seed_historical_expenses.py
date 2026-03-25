"""Seed realistic historical expenses for a Bulgaria-based household profile.

The generated history is anchored to public pricing references and then
profile-shaped with deterministic variation so the data is useful for grouping
and prediction demos.

Pricing anchors used when shaping the data:
- Sofia market prices from Numbeo
- Spotify Bulgaria pricing
- Apple iCloud+ Bulgaria pricing
- Bulgaria annual vignette pricing
- Bulgaria petrol pricing

Run with:
    PYTHONPATH=. ./.venv/bin/python app/scripts/seed_historical_expenses.py --replace
"""

import argparse
import calendar
import random
from datetime import date, datetime, time, timedelta
from decimal import Decimal, ROUND_HALF_UP
from typing import Optional

from sqlalchemy import delete

from app.db.session import SessionLocal
from app.models.expense import Expense

BGN_PER_EUR = Decimal("1.95583")


def quantize_money(value: Decimal) -> Decimal:
    return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def bgn_to_eur(amount_bgn: str) -> Decimal:
    return quantize_money(Decimal(amount_bgn) / BGN_PER_EUR)


def eur(amount: str) -> Decimal:
    return quantize_money(Decimal(amount))


def random_datetime_on_day(purchase_date: date, rng: random.Random) -> datetime:
    hour = rng.randint(8, 21)
    minute = rng.choice([0, 5, 10, 15, 20, 30, 35, 40, 45, 50, 55])
    created = datetime.combine(purchase_date, time(hour=hour, minute=minute))
    if rng.random() < 0.2:
        created += timedelta(days=1)
    return created


def month_start(day: date) -> date:
    return day.replace(day=1)


def add_months(day: date, months: int) -> date:
    total_month = day.month - 1 + months
    year = day.year + total_month // 12
    month = total_month % 12 + 1
    last_day = calendar.monthrange(year, month)[1]
    return day.replace(year=year, month=month, day=min(day.day, last_day))


def choose_day(year: int, month: int, options: list[int], rng: random.Random) -> date:
    last_day = calendar.monthrange(year, month)[1]
    valid_days = [day for day in options if day <= last_day]
    return date(year, month, rng.choice(valid_days))


def scaled(base: Decimal, spread_pct: int, rng: random.Random) -> Decimal:
    pct = Decimal(rng.randint(-spread_pct, spread_pct)) / Decimal("100")
    return quantize_money(base * (Decimal("1") + pct))


def grocery_amount(base: Decimal, rng: random.Random) -> Decimal:
    return scaled(base, 18, rng)


def fuel_amount(liters: Decimal, price_per_liter: Decimal, rng: random.Random) -> Decimal:
    variance = Decimal(rng.randint(-4, 6)) / Decimal("100")
    return quantize_money(liters * price_per_liter * (Decimal("1") + variance))


def seed_profile(months: int, replace: bool) -> int:
    rng = random.Random(20260325)
    today = date.today()
    start = month_start(add_months(today, -(months - 1)))

    # Public-price anchors normalized to EUR where possible.
    spotify_family = eur("9.97")
    netflix_standard = eur("17.99")
    icloud_200gb = bgn_to_eur("5.99")
    annual_vignette = eur("49.60")
    petrol_per_liter = eur("1.31")

    # Profile-shaped baseline amounts.
    bjj_membership = eur("78.00")
    piano_lessons = eur("145.00")
    internet_mobile = eur("43.00")
    electricity_winter = eur("96.00")
    electricity_shoulder = eur("68.00")
    electricity_summer = eur("54.00")
    water_bill = eur("18.00")
    household_monthly = eur("34.00")
    big_grocery_trip = eur("92.00")
    medium_grocery_trip = eur("57.00")
    restaurant_date_night = eur("68.00")
    lunch_out = eur("22.00")
    car_detailing = eur("72.00")
    oil_service = eur("310.00")
    tire_swap = eur("36.00")
    tire_purchase = eur("760.00")
    civil_liability = eur("430.00")
    annual_inspection = eur("32.00")
    piano_tuning = eur("95.00")
    bjj_seminar = eur("85.00")
    bjj_competition = eur("55.00")
    gift_budget = eur("110.00")

    grocery_merchants = ["Fantastico", "Kaufland", "Lidl", "Billa", "Metro"]
    fuel_merchants = ["OMV", "Shell", "EKO", "Rompetrol"]
    household_merchants = ["dm Bulgaria", "IKEA Sofia", "Jumbo"]
    dining_merchants = ["Happy Bar & Grill", "Raffy", "Made in Home", "Niko'las 0/360"]
    grocery_titles = [
        "Weekly groceries",
        "Fresh produce restock",
        "Family grocery run",
        "Bulk grocery shopping",
        "Weekend groceries",
    ]

    created_count = 0

    with SessionLocal() as session:
        if replace:
            session.execute(delete(Expense))
            session.commit()

        current = start
        while current <= today:
            year = current.year
            month = current.month
            month_index = (year - start.year) * 12 + month - start.month

            if month in {12, 1, 2}:
                electricity_base = electricity_winter
            elif month in {6, 7, 8}:
                electricity_base = electricity_summer
            else:
                electricity_base = electricity_shoulder

            monthly_expenses = [
                (
                    choose_day(year, month, [2, 3, 4], rng),
                    "Electricity bill",
                    scaled(electricity_base, 12, rng),
                    "Utilities",
                    "Electrohold Sales",
                    "Monthly household electricity and common-area fees.",
                    True,
                ),
                (
                    choose_day(year, month, [5, 6, 7], rng),
                    "Water bill",
                    scaled(water_bill, 20, rng),
                    "Utilities",
                    "Sofiyska Voda",
                    "Monthly water bill for a two-person household.",
                    True,
                ),
                (
                    choose_day(year, month, [7, 8, 9], rng),
                    "Home internet and mobile plans",
                    scaled(internet_mobile, 8, rng),
                    "Telecom",
                    "A1 Bulgaria",
                    "Home internet plus two mobile plans.",
                    True,
                ),
                (
                    choose_day(year, month, [1], rng),
                    "Spotify Premium Family",
                    spotify_family,
                    "Subscriptions",
                    "Spotify",
                    "Family music streaming plan.",
                    True,
                ),
                (
                    choose_day(year, month, [2], rng),
                    "Netflix Standard",
                    netflix_standard,
                    "Subscriptions",
                    "Netflix",
                    "Main household streaming subscription.",
                    True,
                ),
                (
                    choose_day(year, month, [3], rng),
                    "iCloud+ 200 GB",
                    icloud_200gb,
                    "Subscriptions",
                    "Apple",
                    "Shared cloud storage for devices and photos.",
                    True,
                ),
                (
                    choose_day(year, month, [4, 5], rng),
                    "BJJ membership",
                    scaled(bjj_membership, 8, rng),
                    "BJJ",
                    "Total Brazilian Jiu Jitsu Academy",
                    "Unlimited adult classes and open mat access.",
                    True,
                ),
                (
                    choose_day(year, month, [10, 11, 12], rng),
                    "Piano lessons",
                    scaled(piano_lessons, 10, rng),
                    "Piano",
                    "Private piano instructor",
                    "Four adult piano lessons for the month.",
                    True,
                ),
                (
                    choose_day(year, month, [14, 15, 16], rng),
                    "Household supplies",
                    scaled(household_monthly, 25, rng),
                    "Household",
                    rng.choice(household_merchants),
                    "Cleaning products, toiletries, and household basics.",
                    False,
                ),
            ]

            for purchase_date, title, amount, category, merchant, notes, recurring in monthly_expenses:
                session.add(
                    Expense(
                        title=title,
                        amount=amount,
                        purchase_date=purchase_date,
                        category=category,
                        merchant=merchant,
                        notes=notes,
                        is_recurring=recurring,
                        created_at=random_datetime_on_day(purchase_date, rng),
                    )
                )
                created_count += 1

            # Five grocery visits per month with realistic variation.
            grocery_days = [
                choose_day(year, month, [2, 3, 4, 5], rng),
                choose_day(year, month, [8, 9, 10, 11], rng),
                choose_day(year, month, [14, 15, 16, 17], rng),
                choose_day(year, month, [20, 21, 22, 23], rng),
                choose_day(year, month, [26, 27, 28], rng),
            ]
            grocery_bases = [
                big_grocery_trip,
                medium_grocery_trip,
                medium_grocery_trip,
                big_grocery_trip,
                medium_grocery_trip,
            ]
            for purchase_date, base in zip(grocery_days, grocery_bases):
                session.add(
                    Expense(
                        title=rng.choice(grocery_titles),
                        amount=grocery_amount(base, rng),
                        purchase_date=purchase_date,
                        category="Groceries",
                        merchant=rng.choice(grocery_merchants),
                        notes="Mixed basket of staples, produce, dairy, meat, and snacks.",
                        is_recurring=False,
                        created_at=random_datetime_on_day(purchase_date, rng),
                    )
                )
                created_count += 1

            # Dining and coffee with spouse/friends.
            dining_entries = [
                (
                    choose_day(year, month, [11, 12, 13], rng),
                    "Date night dinner",
                    scaled(restaurant_date_night, 18, rng),
                ),
                (
                    choose_day(year, month, [24, 25, 26], rng),
                    "Lunch out",
                    scaled(lunch_out, 20, rng),
                ),
            ]
            for purchase_date, title, amount in dining_entries:
                session.add(
                    Expense(
                        title=title,
                        amount=amount,
                        purchase_date=purchase_date,
                        category="Dining",
                        merchant=rng.choice(dining_merchants),
                        notes="Eating out instead of cooking at home.",
                        is_recurring=False,
                        created_at=random_datetime_on_day(purchase_date, rng),
                    )
                )
                created_count += 1

            # Fuel for a premium-petrol car hobby profile.
            fillup_days = [
                choose_day(year, month, [4, 5, 6], rng),
                choose_day(year, month, [10, 11, 12], rng),
                choose_day(year, month, [18, 19, 20], rng),
                choose_day(year, month, [25, 26, 27], rng),
            ]
            for purchase_date in fillup_days:
                liters = Decimal(str(rng.randint(42, 58)))
                session.add(
                    Expense(
                        title="Fuel refill",
                        amount=fuel_amount(liters, petrol_per_liter, rng),
                        purchase_date=purchase_date,
                        category="Fuel",
                        merchant=rng.choice(fuel_merchants),
                        notes="Premium petrol fill-up for daily driving and weekend trips.",
                        is_recurring=False,
                        created_at=random_datetime_on_day(purchase_date, rng),
                    )
                )
                created_count += 1

            # Quarterly car detailing.
            if month in {3, 6, 9, 12}:
                purchase_date = choose_day(year, month, [9, 10, 11], rng)
                session.add(
                    Expense(
                        title="Car detailing",
                        amount=scaled(car_detailing, 15, rng),
                        purchase_date=purchase_date,
                        category="Car Maintenance",
                        merchant="Premium Detailing Sofia",
                        notes="Exterior wash, interior deep clean, and paint protection top-up.",
                        is_recurring=False,
                        created_at=random_datetime_on_day(purchase_date, rng),
                    )
                )
                created_count += 1

            # Annual and seasonal items.
            if month == 1:
                purchase_date = choose_day(year, month, [3, 4], rng)
                session.add(
                    Expense(
                        title="Annual road vignette",
                        amount=annual_vignette,
                        purchase_date=purchase_date,
                        category="Road Fees",
                        merchant="BG Toll",
                        notes="Annual passenger car vignette for the national road network.",
                        is_recurring=True,
                        created_at=random_datetime_on_day(purchase_date, rng),
                    )
                )
                created_count += 1

            if month == 2:
                purchase_date = choose_day(year, month, [18, 19], rng)
                session.add(
                    Expense(
                        title="Civil liability insurance",
                        amount=scaled(civil_liability, 12, rng),
                        purchase_date=purchase_date,
                        category="Car Insurance",
                        merchant="Bulstrad",
                        notes="Mandatory annual civil liability insurance.",
                        is_recurring=True,
                        created_at=random_datetime_on_day(purchase_date, rng),
                    )
                )
                created_count += 1

            if month in {4, 10}:
                purchase_date = choose_day(year, month, [6, 7, 8], rng)
                session.add(
                    Expense(
                        title="Seasonal tire change",
                        amount=scaled(tire_swap, 10, rng),
                        purchase_date=purchase_date,
                        category="Car Maintenance",
                        merchant="Dianata",
                        notes="Seasonal tire swap and balancing.",
                        is_recurring=True,
                        created_at=random_datetime_on_day(purchase_date, rng),
                    )
                )
                created_count += 1

            if month == 4 and year % 2 == 0:
                purchase_date = choose_day(year, month, [20, 21], rng)
                session.add(
                    Expense(
                        title="Performance tire set",
                        amount=scaled(tire_purchase, 10, rng),
                        purchase_date=purchase_date,
                        category="Car Maintenance",
                        merchant="Pro Tires Sofia",
                        notes="Replacement summer tire set for the hobby car.",
                        is_recurring=False,
                        created_at=random_datetime_on_day(purchase_date, rng),
                    )
                )
                created_count += 1

            if month == 6:
                purchase_date = choose_day(year, month, [12, 13], rng)
                session.add(
                    Expense(
                        title="Annual service",
                        amount=scaled(oil_service, 14, rng),
                        purchase_date=purchase_date,
                        category="Car Maintenance",
                        merchant="Auto Bavaria",
                        notes="Oil service, filters, and inspection of wear items.",
                        is_recurring=True,
                        created_at=random_datetime_on_day(purchase_date, rng),
                    )
                )
                created_count += 1

            if month == 7:
                purchase_date = choose_day(year, month, [15], rng)
                session.add(
                    Expense(
                        title="Annual technical inspection",
                        amount=scaled(annual_inspection, 8, rng),
                        purchase_date=purchase_date,
                        category="Car Maintenance",
                        merchant="Technotest",
                        notes="Mandatory annual technical inspection.",
                        is_recurring=True,
                        created_at=random_datetime_on_day(purchase_date, rng),
                    )
                )
                created_count += 1

            if month == 9:
                purchase_date = choose_day(year, month, [22, 23], rng)
                session.add(
                    Expense(
                        title="BJJ seminar",
                        amount=scaled(bjj_seminar, 10, rng),
                        purchase_date=purchase_date,
                        category="BJJ",
                        merchant="Twisted Jiu Jitsu",
                        notes="Guest-instructor seminar and mat fee.",
                        is_recurring=False,
                        created_at=random_datetime_on_day(purchase_date, rng),
                    )
                )
                created_count += 1

            if month == 10:
                purchase_date = choose_day(year, month, [14, 15], rng)
                session.add(
                    Expense(
                        title="Piano tuning",
                        amount=scaled(piano_tuning, 12, rng),
                        purchase_date=purchase_date,
                        category="Piano",
                        merchant="Piano service Sofia",
                        notes="Annual piano tuning and minor regulation.",
                        is_recurring=True,
                        created_at=random_datetime_on_day(purchase_date, rng),
                    )
                )
                created_count += 1

            if month in {5, 11}:
                purchase_date = choose_day(year, month, [17, 18], rng)
                session.add(
                    Expense(
                        title="BJJ competition registration",
                        amount=scaled(bjj_competition, 10, rng),
                        purchase_date=purchase_date,
                        category="BJJ",
                        merchant="Bulgarian BJJ Federation",
                        notes="Competition entry fee and event-day expenses.",
                        is_recurring=False,
                        created_at=random_datetime_on_day(purchase_date, rng),
                    )
                )
                created_count += 1

            if month in {2, 12}:
                purchase_date = choose_day(year, month, [12, 13, 14], rng)
                session.add(
                    Expense(
                        title="Family gifts",
                        amount=scaled(gift_budget, 35, rng),
                        purchase_date=purchase_date,
                        category="Family",
                        merchant="Mall of Sofia",
                        notes="Holiday and occasion gifts for spouse and family.",
                        is_recurring=False,
                        created_at=random_datetime_on_day(purchase_date, rng),
                    )
                )
                created_count += 1

            # Small inflation drift over two years.
            if month_index % 6 == 0 and month_index > 0:
                big_grocery_trip = quantize_money(big_grocery_trip * Decimal("1.015"))
                medium_grocery_trip = quantize_money(medium_grocery_trip * Decimal("1.015"))
                household_monthly = quantize_money(household_monthly * Decimal("1.01"))

            current = add_months(current, 1)

        session.commit()

    return created_count


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--months", type=int, default=24)
    parser.add_argument(
        "--replace",
        action="store_true",
        help="Delete existing expenses before inserting the historical dataset.",
    )
    args = parser.parse_args()

    created_count = seed_profile(months=args.months, replace=args.replace)
    print(f"Seeded {created_count} expenses.")


if __name__ == "__main__":
    main()
