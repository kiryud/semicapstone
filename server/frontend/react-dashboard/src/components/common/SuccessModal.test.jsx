import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import SuccessModal from "./SuccessModal.jsx";

describe("SuccessModal", () => {
  it("renders the backend login message as an accessible dialog", () => {
    const markup = renderToStaticMarkup(
      <SuccessModal
        message="로그인 성공! 환영합니다."
        onConfirm={() => {}}
      />,
    );

    expect(markup).toContain('role="dialog"');
    expect(markup).toContain('aria-modal="true"');
    expect(markup).toContain("로그인 성공! 환영합니다.");
    expect(markup).toContain("대시보드로 이동");
  });
});
