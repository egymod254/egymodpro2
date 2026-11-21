"""Rebuild www/data.js from the three Excel workbooks.
Usage:  python tools/excel_to_data.py overtime.xlsx leaves.xlsx advances.xlsx
Needs:  pip install openpyxl
"""
import json, sys, re, warnings
from openpyxl import load_workbook
warnings.filterwarnings("ignore")

def txt(v):
    if v is None: return ""
    if isinstance(v, float) and v == int(v): v = int(v)
    return str(v).strip()

def build(ot_path, lv_path, adv_path):
    ot, lv, adv = (load_workbook(p, data_only=True) for p in (ot_path, lv_path, adv_path))
    E, byname, bycode = [], {}, {}
    def add(code, name):
        name = " ".join(name.split())
        if code in bycode or name in byname: return bycode.get(code) or byname.get(name)
        e = {"c": code, "n": name, "h": ""}; E.append(e); bycode[code] = byname[name] = e; return e
    m = ot["الرئيسية"]
    for r in range(5, 120):
        if m.cell(r, 1).value and m.cell(r, 2).value: add(txt(m.cell(r, 1).value), txt(m.cell(r, 2).value))
    am = adv["الرئيسية"]
    for r in range(6, 120):
        if am.cell(r, 1).value and am.cell(r, 2).value: add(txt(am.cell(r, 1).value), txt(am.cell(r, 2).value))
    ld = lv["بيانات الموظفين"]; leave_only = []
    for r in range(6, 504):
        nm = ld.cell(r, 2).value
        if not nm: continue
        nm = " ".join(str(nm).split()); e = byname.get(nm)
        if e is None:
            n = ld.cell(r, 1).value
            code = "E%03d" % int(n) if n else "L%03d" % r
            if code in bycode: code = "L%03d" % r          # never reuse another employee's code
            e = add(code, nm); leave_only.append((code, nm))
        if ld.cell(r, 3).value: e["h"] = ld.cell(r, 3).value.strftime("%Y-%m-%d")
    S = {"E": E, "ot": {}, "k": {}, "pen": {}, "ab": {}, "adv": {}, "lv": {}}
    for r in range(5, 120):
        code = txt(m.cell(r, 1).value)
        if not code: continue
        v = m.cell(r, 3).value
        if v not in (None, ""):
            s = ("%.2f" % float(v)) if isinstance(v, (int, float)) else str(v).replace(",", ".")
            h, _, mm = s.partition("."); S["k"][code] = int(h) * 60 + int((mm or "0").ljust(2, "0")[:2])
        if code in ot.sheetnames:
            ws = ot[code]
            for d in range(1, 32):
                i, o = txt(ws.cell(5 + d, 2).value), txt(ws.cell(5 + d, 4).value)
                if i or o:
                    S["ot"].setdefault(code, {})[str(d)] = {"i": i, "ip": txt(ws.cell(5 + d, 3).value) or "ص", "o": o,
                        "op": txt(ws.cell(5 + d, 5).value) or "م", "nx": 1 if txt(ws.cell(5 + d, 6).value) == "تاني يوم" else 0}
    for key, sh in (("adv", "السلف"), ("pen", "الجزاءات"), ("ab", "الغياب")):
        ws = adv[sh]
        for r in range(6, 120):
            code = txt(ws.cell(r, 1).value)
            for d in range(1, 32):
                v = ws.cell(r, 3 + d).value
                if code and isinstance(v, (int, float)) and v: S[key].setdefault(code, {})[str(d)] = v
    lg = lv["سجل الإجازات"]
    for r in range(3, 3003):
        nm, f, t = lg.cell(r, 2).value, lg.cell(r, 4).value, lg.cell(r, 5).value
        e = byname.get(" ".join(str(nm).split())) if nm else None
        if e and f:
            rec = {"f": f.strftime("%Y-%m-%d")}
            if t: rec["t"] = t.strftime("%Y-%m-%d")
            S["lv"].setdefault(e["c"], []).append(rec)
    p = re.search(r"(\S+)\s+(\d{4})", txt(adv["السلف"]["A1"].value)); S["period"] = p.group(1) + " " + p.group(2) if p else ""
    return S, leave_only

if __name__ == "__main__":
    S, lo = build(*sys.argv[1:4])
    open("www/data.js", "w", encoding="utf-8").write("window.SEED_DATA=" + json.dumps(S, ensure_ascii=False, separators=(",", ":")) + ";\n")
    print("employees:", len(S["E"]), "| OT days:", sum(len(v) for v in S["ot"].values()), "| carried:", len(S["k"]),
          "| adv/pen/abs:", sum(len(v) for v in S["adv"].values()), sum(len(v) for v in S["pen"].values()), sum(len(v) for v in S["ab"].values()),
          "| leaves:", sum(len(v) for v in S["lv"].values()), "| leave-only names:", lo, "| period:", S["period"])
