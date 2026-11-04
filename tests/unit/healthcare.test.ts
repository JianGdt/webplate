import { beforeEach, expect, it } from "vitest";
import { useClinicStore } from "../../src/templates/healthcare-dashboard/store";
const initial = useClinicStore.getState();
beforeEach(() => useClinicStore.setState(initial, true));
it("rejects occupied appointment slots without adding a record", () => {
  const { patient, department, date, time } = initial.appointments[0];
  expect(
    useClinicStore.getState().add({ patient, department, date, time }),
  ).toContain("already has");
  expect(useClinicStore.getState().appointments).toHaveLength(4);
});
it("validates appointment data and keeps invalid status changes out", () => {
  expect(
    useClinicStore.getState().add({ patient: "A", date: "invalid" }),
  ).not.toBe("");
  useClinicStore.getState().update(1, "Unknown");
  expect(useClinicStore.getState().appointments[0].status).toBe("Completed");
});
it("allows a cancelled slot to be reused", () => {
  const { patient, department, date, time } = initial.appointments[0];
  useClinicStore.getState().update(1, "Cancelled");
  expect(
    useClinicStore.getState().add({ patient, department, date, time }),
  ).toBe("");
  expect(useClinicStore.getState().appointments).toHaveLength(5);
  expect(useClinicStore.getState().update(1, "Scheduled")).toContain(
    "rebooked",
  );
  expect(useClinicStore.getState().appointments[0].status).toBe("Cancelled");
});
