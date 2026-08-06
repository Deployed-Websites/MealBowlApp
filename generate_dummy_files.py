"""
generate_dummy_files.py
~~~~~~~~~~~~~~~~~~~~~~~
Generates a specified number of dummy .xlsx files in a target folder,
each with random data in a specified cell range on a specified sheet.
Useful for testing combine_excel.py.

Usage
-----
    python generate_dummy_files.py <folder> <count> <sheet> <start_cell> <end_cell>

Positional arguments
    folder        Folder to write dummy files into (created if it doesn't exist)
    count         Number of dummy files to generate
    sheet         Sheet name to create in each file
    start_cell    Top-left cell of the data range  e.g. B3
    end_cell      Bottom-right cell of the range   e.g. B52

Optional arguments
    --prefix      Filename prefix (default: "dummy_file_")
    --data-type   Type of random data: float | int | mixed (default: float)
    --min         Minimum value (default: 0)
    --max         Maximum value (default: 10000)
    --decimals    Decimal places for float data (default: 2)

Examples
    # 50 files, range B3:B52 on sheet named "Summary"
    python generate_dummy_files.py ./test_files 50 Summary B3 B52

    # 10 files with integer data between 1 and 500
    python generate_dummy_files.py ./test_files 10 Summary B3 B52 --data-type int --min 1 --max 500
"""

import argparse
import os
import random
import re
import sys
from pathlib import Path

import openpyxl
from openpyxl.utils import column_index_from_string


def parse_cell(cell_str):
    m = re.match(r"([A-Za-z]+)(\d+)", cell_str.strip())
    if not m:
        raise ValueError(f"Cannot parse cell reference: {cell_str!r}")
    return column_index_from_string(m.group(1)), int(m.group(2))


def random_value(data_type, min_val, max_val, decimals):
    if data_type == "int":
        return random.randint(int(min_val), int(max_val))
    elif data_type == "float":
        return round(random.uniform(min_val, max_val), decimals)
    else:  # mixed
        if random.random() < 0.5:
            return random.randint(int(min_val), int(max_val))
        else:
            return round(random.uniform(min_val, max_val), decimals)


def generate_files(folder, count, sheet_name, col, row_start, row_end,
                   prefix, data_type, min_val, max_val, decimals):
    folder = Path(folder)
    folder.mkdir(parents=True, exist_ok=True)

    num_rows = row_end - row_start + 1
    pad = len(str(count))  # zero-pad filenames

    for i in range(1, count + 1):
        filename = f"{prefix}{str(i).zfill(pad)}.xlsx"
        filepath = folder / filename

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = sheet_name

        for row in range(row_start, row_end + 1):
            ws.cell(row=row, column=col,
                    value=random_value(data_type, min_val, max_val, decimals))

        wb.save(filepath)

        print(f"  [{i}/{count}] {filename}")

    print(f"\nDone. {count} file(s) written to: {folder.resolve()}")


def main():
    parser = argparse.ArgumentParser(
        description="Generate dummy Excel files for testing combine_excel.py"
    )
    parser.add_argument("folder",     help="Output folder for dummy files")
    parser.add_argument("count",      type=int, help="Number of files to generate")
    parser.add_argument("sheet",      help="Sheet name to create in each file")
    parser.add_argument("start_cell", help="Top-left cell of data range e.g. B3")
    parser.add_argument("end_cell",   help="Bottom-right cell of data range e.g. B52")
    parser.add_argument("--prefix",    default="dummy_file_", help="Filename prefix")
    parser.add_argument("--data-type", default="float",
                        choices=["float", "int", "mixed"],
                        help="Type of random data (default: float)")
    parser.add_argument("--min",       type=float, default=0,
                        help="Minimum random value (default: 0)")
    parser.add_argument("--max",       type=float, default=10000,
                        help="Maximum random value (default: 10000)")
    parser.add_argument("--decimals",  type=int, default=2,
                        help="Decimal places for float data (default: 2)")
    args = parser.parse_args()

    if args.count < 1:
        sys.exit("Error: count must be at least 1")
    if args.min >= args.max:
        sys.exit("Error: --min must be less than --max")

    col, row_start = parse_cell(args.start_cell)
    col_end, row_end = parse_cell(args.end_cell)

    if col != col_end:
        sys.exit("Error: start and end cells must be in the same column")
    if row_start > row_end:
        sys.exit("Error: start row must be <= end row")

    print(f"Generating {args.count} file(s) in '{args.folder}' ...")
    print(f"Sheet: '{args.sheet}'  |  Range: {args.start_cell}:{args.end_cell}  "
          f"|  Data: {args.data_type}  |  Range: {args.min}–{args.max}\n")

    generate_files(
        folder=args.folder,
        count=args.count,
        sheet_name=args.sheet,
        col=col,
        row_start=row_start,
        row_end=row_end,
        prefix=args.prefix,
        data_type=args.data_type,
        min_val=args.min,
        max_val=args.max,
        decimals=args.decimals,
    )


if __name__ == "__main__":
    main()
