import { describe, it, expect, beforeEach } from "vitest";
import { useContentStore } from "../../src/templates/cms/store";
import { useCrmStore } from "../../src/templates/crm/store";
import { useInventoryStore } from "../../src/templates/inventory/store";
const content = useContentStore.getState(),
  crm = useCrmStore.getState(),
  inventory = useInventoryStore.getState();
beforeEach(() => {
  useContentStore.setState(content, true);
  useCrmStore.setState(crm, true);
  useInventoryStore.setState(inventory, true);
});
describe("dashboard data boundaries", () => {
  it("rejects invalid content without modifying the library", () => {
    expect(useContentStore.getState().save({ title: "x" })).toBe(false);
    expect(useContentStore.getState().articles).toHaveLength(4);
  });
  it("rejects unknown pipeline stages", () => {
    useCrmStore.getState().move(1, "Deleted");
    expect(useCrmStore.getState().contacts[0].stage).toBe("New");
  });
  it("rejects negative or excessive stock and leaves the ledger intact", () => {
    for (const quantity of [-1, 0, 999999])
      expect(
        useInventoryStore
          .getState()
          .adjust({ id: 1, quantity, kind: "Receive" }),
      ).not.toBe("");
    expect(useInventoryStore.getState().movements).toHaveLength(0);
  });
  it("dispatches exactly available stock atomically", () => {
    expect(
      useInventoryStore
        .getState()
        .adjust({ id: 2, quantity: 8, kind: "Dispatch" }),
    ).toBe("");
    expect(useInventoryStore.getState().products[1].quantity).toBe(0);
    expect(useInventoryStore.getState().movements).toHaveLength(1);
    expect(
      useInventoryStore
        .getState()
        .adjust({ id: 2, quantity: 1, kind: "Dispatch" }),
    ).toContain("Not enough");
    expect(useInventoryStore.getState().movements).toHaveLength(1);
  });
  it("rejects duplicate SKUs case-insensitively", () => {
    const { id, ...product } = inventory.products[0];
    expect(id).toBe(1);
    expect(
      useInventoryStore
        .getState()
        .add({ ...product, sku: product.sku.toLowerCase() }),
    ).toContain("already exists");
  });
});
