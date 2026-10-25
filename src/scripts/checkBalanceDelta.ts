import assert from "assert";
import { balanceDelta } from "../controllers/leaveRequestController";

assert.deepStrictEqual(balanceDelta("PENDING", "APPROVED", 3), { pending: -3, used: 3 });
assert.deepStrictEqual(balanceDelta("PENDING", "REJECTED", 3), { pending: -3, used: 0 });
assert.deepStrictEqual(balanceDelta("PENDING", "CANCELLED", 1.5), { pending: -1.5, used: 0 });
assert.deepStrictEqual(balanceDelta("APPROVED", "CANCELLED", 2), { pending: 0, used: -2 });
console.log("balanceDelta ok");
