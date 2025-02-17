import BN from "bn.js";
import { OptionSide, OptionType } from "../types/options";
import { getToApprove, longInteger } from "./computations";

type ToApproveDataset = {
  size: number;
  premia: BN;
  correct: BN;
};

const longCallDataset: ToApproveDataset[] = [
  {
    size: 1,
    premia: new BN("145645927995050205"),
    correct: new BN("160210520794555225"),
  },
];

const shortCallDataset: ToApproveDataset[] = [
  {
    size: 1,
    premia: new BN("145645927995050205"),
    correct: new BN("868918664804454816"),
  },
];

const longPutDataset: ToApproveDataset[] = [
  {
    size: 1,
    premia: new BN("145645927995050205"),
    correct: new BN("160210520794555225"),
  },
];

const shortPutDataset: ToApproveDataset[] = [
  {
    size: 1,
    premia: new BN("178503892"),
    correct: new BN("1039346498"),
  },
];

describe("approve amount", () => {
  test("LONG CALL", () => {
    longCallDataset.forEach(({ size, premia, correct }) => {
      const res = getToApprove(
        OptionType.Call,
        OptionSide.Long,
        size,
        premia,
        1000 // strike price is only relevant for short put
      );
      expect(res.eq(correct)).toBe(true);
    });
  });
  test("SHORT CALL", () => {
    shortCallDataset.forEach(({ size, premia, correct }) => {
      const res = getToApprove(OptionType.Call, OptionSide.Short, size, premia);
      expect(res.eq(correct)).toBe(true);
    });
  });
  test("LONG PUT", () => {
    longPutDataset.forEach(({ size, premia, correct }) => {
      const res = getToApprove(OptionType.Put, OptionSide.Long, size, premia);
      expect(res.eq(correct)).toBe(true);
    });
  });
  test("SHORT PUT", () => {
    shortPutDataset.forEach(({ size, premia, correct }) => {
      const res = getToApprove(
        OptionType.Put,
        OptionSide.Short,
        size,
        premia,
        1200
      );
      expect(res.eq(correct)).toBe(true);
    });
  });
});

describe("long integer", () => {
  test("18 digits, n > 1", () => {
    const input = 100.00123;
    const expectedResult = new BN("100001230000000000000");
    const res = longInteger(input, 18);
    expect(res.eq(expectedResult)).toBe(true);
  });

  test("18 digits, n < 1", () => {
    const input = 0.00000123;
    const expectedResult = new BN("1230000000000");
    const res = longInteger(input, 18);
    expect(res.eq(expectedResult)).toBe(true);
  });

  test("18 digits, n == 1", () => {
    const input = 1;
    const expectedResult = new BN("1000000000000000000");
    const res = longInteger(input, 18);
    expect(res.eq(expectedResult)).toBe(true);
  });

  test("more digits than requested", () => {
    const input = 0.123456789;
    const expectedResult = new BN("123");
    const res = longInteger(input, 3);
    expect(res.eq(expectedResult)).toBe(true);
  });

  test("scientific notation", () => {
    const input = 1.0679258529442e-7;
    const expectedResult = new BN("106792585294");
    const res = longInteger(input, 18);
    expect(res.eq(expectedResult)).toBe(true);
  });
});

export {};
