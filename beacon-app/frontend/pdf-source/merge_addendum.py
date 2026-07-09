from pypdf import PdfWriter
import shutil, os

DIR = os.path.dirname(os.path.abspath(__file__))
RUNBOOK = os.path.join(DIR, "runbook.pdf")
ADDENDUM = os.path.join(DIR, "activation-addendum.pdf")
FINAL = os.path.join(DIR, "..", "public", "Beacon-Markets-3min-Demo-Runbook.pdf")
TMP = FINAL + ".tmp"

writer = PdfWriter()
writer.append(RUNBOOK)     # pages 1-5, the base runbook
writer.append(ADDENDUM)    # page 6, the Activations beat
with open(TMP, "wb") as f:
    writer.write(f)

shutil.move(TMP, FINAL)  # atomic write of the complete 6-page runbook
print("wrote", FINAL)
