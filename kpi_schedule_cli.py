#!/usr/bin/env python3
"""
КПІ Мій Розклад - CLI скрипт
Автоматично витягує групу та предмети з ІНП, запитує schedule.kpi.ua та виводить персональний розклад.
"""

import sys
import os
import re
import json
import urllib.request
import ssl
from typing import List, Dict, Any, Optional

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

BASE_URL = "https://api.campus.kpi.ua"

def normalize_name(text: str) -> str:
    if not text:
        return ""
    clean = text.lower()
    clean = re.sub(r'\(ф\d+\s+б\s+[^\)]+\)', '', clean)
    clean = re.sub(r'\(авторський курс[^\)]*\)', '', clean)
    clean = re.sub(r'\(сертифікатна програма[^\)]*\)', '', clean)
    clean = re.sub(r'\(частина\s+\d+\)', '', clean)
    clean = re.sub(r'[\(\)\[\]\.\,\-\–\—\'\"`’«»]', ' ', clean)
    clean = clean.replace('i', 'і').replace('e', 'е')
    return re.sub(r'\s+', ' ', clean).strip()

def is_match(lesson_name: str, subject_name: str) -> bool:
    s1 = normalize_name(lesson_name)
    s2 = normalize_name(subject_name)
    if not s1 or not s2:
        return False
    if s1 == s2 or s1 in s2 or s2 in s1:
        return True

    # Disambiguation filters
    if 'мереж' in s1 and 'мереж' not in s2: return False
    if 'мереж' in s2 and 'мереж' not in s1: return False

    if 'техніч' in s1 and 'техніч' not in s2: return False
    if 'техніч' in s2 and 'техніч' not in s1: return False

    if '.net' in s1 and '.net' not in s2: return False
    if '.net' in s2 and '.net' not in s1: return False

    if 'моделюван' in s1 and 'моделюван' not in s2: return False
    if 'моделюван' in s2 and 'моделюван' not in s1: return False

    if 'графік' in s1 and 'графік' not in s2: return False
    if 'графік' in s2 and 'графік' not in s1: return False

    w1 = [w for w in s1.split() if len(w) > 2]
    w2 = [w for w in s2.split() if len(w) > 2]
    if not w1 or not w2:
        return False
    matches = sum(1 for a in w1 if any(b.startswith(a[:4]) or a.startswith(b[:4]) for b in w2))
    return (matches / max(len(w1), len(w2))) >= 0.6

def fetch_json(endpoint: str) -> Any:
    req = urllib.request.Request(f"{BASE_URL}{endpoint}", headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
        return json.loads(resp.read().decode("utf-8"))

def find_group_id(group_name: str) -> Optional[int]:
    try:
        groups = fetch_json("/group/all")
        for g in groups:
            if g.get("name", "").lower() == group_name.lower():
                return g.get("id")
        for g in groups:
            if group_name.lower() in g.get("name", "").lower():
                return g.get("id")
    except Exception as e:
        print(f"[!] Помилка запиту списку груп: {e}")
    return 3672

def filter_schedule(raw_schedule: Dict[str, Any], inp_subjects: List[str]):
    for week_key, week_title in [("scheduleFirstWeek", "1 ТИЖДЕНЬ (НЕПАРНИЙ)"), ("scheduleSecondWeek", "2 ТИЖДЕНЬ (ПАРНИЙ)")]:
        print("\n" + "=" * 60)
        print(f"   {week_title}")
        print("=" * 60)
        days = raw_schedule.get(week_key, [])
        for day in days:
            day_name = day.get("day", "")
            pairs = day.get("pairs", [])
            matched = []
            for p in pairs:
                for subj in inp_subjects:
                    if is_match(p.get("name", ""), subj):
                        matched.append((p, subj))
                        break
            
            if matched:
                print(f"\n[+] {day_name}:")
                for p, subj in matched:
                    t = p.get("time", "")[:5]
                    ptype = p.get("type", "Пара")
                    name = p.get("name", "")
                    lect = p.get("lecturer", {}).get("name") if p.get("lecturer") else "Викладач кафедри"
                    print(f"   - {t} [{ptype}] {name} ({lect})")
            else:
                print(f"\n[+] {day_name}: Занять немає (вільний день)")

def main():
    print("=" * 60)
    print("   КПІ Мій Розклад | Фільтр пар за Індивідуальним Планом")
    print("=" * 60)

    inp_subjects = [
        "Економіка і підприємництво",
        "Проєктування інформаційних систем",
        "Інтелектуальні технологій в робототехніці",
        "Практичний курс іноземної мови професійного спрямування",
        "Управління технічними системами",
        "Менеджмент в продуктовому ІТ",
        "Розроблення VR/AR застосунків",
        "Основи WEB – технологій"
    ]
    
    group_name = "ІК-31"
    print(f"[+] Навчальна група: {group_name}")
    print(f"[+] Студент: Ганзіна Данііл Геннадійович")
    print(f"[+] Кількість предметів в ІНП (7 семестр): {len(inp_subjects)}")

    print(f"\n[+] Отримання розкладу з schedule.kpi.ua для групи {group_name}...")
    group_id = find_group_id(group_name)
    if not group_id:
        print("[-] Групу не знайдено на сервері.")
        return

    try:
        raw_schedule = fetch_json(f"/schedule/lessons?groupId={group_id}")
        filter_schedule(raw_schedule, inp_subjects)
    except Exception as e:
        print(f"[-] Помилка отримання розкладу: {e}")

if __name__ == "__main__":
    main()
