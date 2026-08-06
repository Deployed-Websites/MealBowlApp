"""
combine_excel.py
~~~~~~~~~~~~~~~~
Reads a specific cell range from every .xlsx/.xls file in a folder,
combines them into a single output file (one source file = one column),
and remembers which files have already been processed so re-runs are
incremental.

Usage
-----
    python combine_excel.py <folder> <output_file> <sheet> <start_cell> <end_cell> [options]

Positional arguments
    folder        Path to folder containing source Excel files
    output_file   Path to the combined output .xlsx (created or updated)
    sheet         Sheet name or 0-based sheet index to read from each file
    start_cell    Top-left cell of the range  e.g. B3
    end_cell      Bottom-right cell of the range  e.g. B52

Optional arguments
    --header-row ROW   Row number (1-based) inside the range to use as column
                       header for that file.  Default: use filename as header.
    --label-col        Write row labels (A-column cell values) from the first
                       processed file into column A of the output.
    --state-file PATH  Where to store the processing record.
                       Default: <output_file>.state.json
    --force            Re-process all files, ignoring the state record.

Examples
    # First run – process everything in /data/reports, range B3:B52 on "Summary"
    python combine_excel.py /data/reports combined.xlsx Summary B3 B52

    # Re-run – only new files are added; combined.xlsx is updated in place
    python combine_excel.py /data/reports combined.xlsx Summary B3 B52
"""

import argparse
import json
import os
import re
import sys
from pathlib import Path

import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import column_index_from_string, get_column_letter


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def parse_cell(cell_str: str):
    """Return (col_index, row_index) from a cell reference like 'B3'."""
    m = re.match(r"([A-Za-z]+)(\d+)", cell_str.strip())
    if not m:
        raise ValueError(f"Cannot parse cell reference: {cell_str!r}")
    return column_index_from_string(m.group(1)), int(m.group(2))


def read_range(filepath: Path, sheet_ref, col_start, row_start, col_end, row_end):
    """
    Open an Excel file and return the values in the requested range as a list.
    Works even when the file contains formulas – openpyxl reads cached values.
    Returns a flat list of values, one per row.
    """
    wb = openpyxl.load_workbook(filepath, data_only=True, read_only=True)

    # Resolve sheet
    if isinstance(sheet_ref, int):
        sheet = wb.worksheets[sheet_ref]
    else:
        if sheet_ref not in wb.sheetnames:
            wb.close()
            raise ValueError(
                f"{filepath.name}: sheet {sheet_ref!r} not found. "
                f"Available: {wb.sheetnames}"
            )
        sheet = wb[sheet_ref]

    values = []
    for row in range(row_start, row_end + 1):
        cell = sheet.cell(row=row, column=col_start)
        values.append(cell.value)

    wb.close()
    return values


def load_state(state_path: Path) -> dict:
    if state_path.exists():
        with open(state_path) as f:
            return json.load(f)
    return {"processed": {}}   # {filename: mtime}


def save_state(state_path: Path, state: dict):
    with open(state_path, "w") as f:
        json.dump(state, f, indent=2)


def style_header(cell):
    cell.font = Font(name="Arial", bold=True, color="FFFFFF")
    cell.fill = PatternFill("solid", fgColor="2F5496")
    cell.alignment = Alignment(horizontal="center", wrap_text=True)


def style_label(cell):
    cell.font = Font(name="Arial", italic=True, color="404040")
    cell.alignment = Alignment(horizontal="left")


# ---------------------------------------------------------------------------
# Core logic
# ---------------------------------------------------------------------------

def discover_files(folder: Path):
    """Return sorted list of .xlsx / .xls files in folder (non-recursive)."""
    return sorted(
        p for p in folder.iterdir()
        if p.is_file() and p.suffix.lower() in (".xlsx", ".xls", ".xlsm")
    )


def build_or_update(
    folder: Path,
    output_path: Path,
    sheet_ref,
    col_start, row_start,
    col_end, row_end,
    header_row: int | None,
    label_col: bool,
    state_path: Path,
    force: bool,
):
    state = load_state(state_path)
    processed = state["processed"]   # filename -> mtime

    source_files = discover_files(folder)
    if not source_files:
        print("No Excel files found in folder.")
        return

    # Decide which files need (re-)processing
    new_files = []
    for f in source_files:
        mtime = str(f.stat().st_mtime)
        if force or f.name not in processed or processed[f.name] != mtime:
            new_files.append(f)

    if not new_files:
        print("No new or modified files detected.  Nothing to do.")
        return

    print(f"Found {len(source_files)} file(s) total, {len(new_files)} to process.")

    # Load existing output (or create fresh)
    if output_path.exists() and not force:
        wb_out = openpyxl.load_workbook(output_path)
        ws = wb_out.active
        # Build a map of existing column headers (row 1) -> column index
        existing_headers = {}
        for col in range(1, ws.max_column + 1):
            h = ws.cell(row=1, column=col).value
            if h is not None:
                existing_headers[h] = col
        next_col = ws.max_column + 1
    else:
        wb_out = openpyxl.Workbook()
        ws = wb_out.active
        ws.title = "Combined"
        existing_headers = {}
        next_col = 2 if label_col else 1   # col 1 reserved for labels if requested

    num_rows = row_end - row_start + 1

    # Write row labels from first file (only if output is brand-new)
    label_written = (ws.max_row > 1) or (not label_col)

    errors = []
    newly_added = 0

    for filepath in new_files:
        print(f"  Processing {filepath.name} ...", end=" ")
        try:
            values = read_range(filepath, sheet_ref,
                                col_start, row_start,
                                col_end, row_end)
        except Exception as exc:
            print(f"ERROR: {exc}")
            errors.append((filepath.name, str(exc)))
            continue

        # Determine column header
        col_header = filepath.stem   # default: filename without extension

        # If already in output, overwrite that column; otherwise append
        if col_header in existing_headers:
            target_col = existing_headers[col_header]
        else:
            target_col = next_col
            existing_headers[col_header] = target_col
            next_col += 1
            newly_added += 1

        # Header row (row 1)
        hdr_cell = ws.cell(row=1, column=target_col, value=col_header)
        style_header(hdr_cell)

        # Write values starting at row 2
        for i, val in enumerate(values):
            ws.cell(row=2 + i, column=target_col, value=val)

        # Write row-label column (col A) from first file ever written
        if label_col and not label_written:
            ws.cell(row=1, column=1, value="Row Label")
            style_header(ws.cell(row=1, column=1))
            row_num = row_start
            for i, val in enumerate(values):
                lbl = ws.cell(row=2 + i, column=1,
                              value=f"Row {row_num + i}")
                style_label(lbl)
            label_written = True

        # Mark processed
        processed[filepath.name] = str(filepath.stat().st_mtime)
        print("OK")

    # Column widths
    for col in range(1, ws.max_column + 1):
        ws.column_dimensions[get_column_letter(col)].width = 20

    wb_out.save(output_path)
    save_state(state_path, state)

    print()
    print(f"Done.  {newly_added} new column(s) added.")
    if errors:
        print(f"\nWarning: {len(errors)} file(s) had errors and were skipped:")
        for name, msg in errors:
            print(f"  {name}: {msg}")
    print(f"Output:     {output_path}")
    print(f"State file: {state_path}")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Combine a cell range across many Excel files into one output file."
    )
    parser.add_argument("folder",      help="Folder containing source Excel files")
    parser.add_argument("output_file", help="Combined output .xlsx path")
    parser.add_argument("sheet",       help="Sheet name or 0-based index")
    parser.add_argument("start_cell",  help="Top-left cell of range, e.g. B3")
    parser.add_argument("end_cell",    help="Bottom-right cell of range, e.g. B52")
    parser.add_argument("--header-row", type=int, default=None,
                        help="1-based row within the range to use as column header")
    parser.add_argument("--label-col", action="store_true",
                        help="Write row labels into column A")
    parser.add_argument("--state-file", default=None,
                        help="Path for the processing-record JSON")
    parser.add_argument("--force", action="store_true",
                        help="Ignore state file; re-process every file")
    args = parser.parse_args()

    folder = Path(args.folder)
    if not folder.is_dir():
        sys.exit(f"Error: {folder} is not a directory.")

    output_path = Path(args.output_file)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    state_path = Path(args.state_file) if args.state_file \
        else output_path.with_suffix(".state.json")

    # Sheet: integer index or name
    try:
        sheet_ref = int(args.sheet)
    except ValueError:
        sheet_ref = args.sheet

    col_start, row_start = parse_cell(args.start_cell)
    col_end,   row_end   = parse_cell(args.end_cell)

    if col_start != col_end:
        sys.exit("Error: start and end cells must be in the same column "
                 "(this tool extracts one column per file).")

    build_or_update(
        folder=folder,
        output_path=output_path,
        sheet_ref=sheet_ref,
        col_start=col_start, row_start=row_start,
        col_end=col_end,     row_end=row_end,
        header_row=args.header_row,
        label_col=args.label_col,
        state_path=state_path,
        force=args.force,
    )


if __name__ == "__main__":
    main()
