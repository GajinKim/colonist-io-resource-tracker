const { sanitizeEventText } = require("./explorer.js");

test("placed settlement", () => {
  let text = `<img src="/dist/images/icon_player.svg?v154" alt="Guest" height="20" width="20">Lipsey#9392 placed a <img src="/dist/images/settlement_red.svg?v154" alt="settlement" height="20" width="20" class="lobby-chat-text-icon">`;
  expect(sanitizeEventText(text)).toBe("Lipsey#9392 placed a SETTLEMENT");
});

test("placed road", () => {
    let text = `<img src="/dist/images/icon_player.svg?v154" alt="Guest" height="20" width="20">Lipsey#9392 placed a <img src="/dist/images/road_red.svg?v154" alt="road" height="20" width="20" class="lobby-chat-text-icon">`;
    expect(sanitizeEventText(text)).toBe("Lipsey#9392 placed a ROAD")
})