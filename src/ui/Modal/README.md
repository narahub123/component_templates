# Modal 컴포넌트 가이드

이 문서는 `src/ui/Modal` 폴더에 정의된 모달 컴포넌트를 사용하는 방법을 정리한 것입니다. 모달은 접근성, 포커스 관리, 중첩 관리까지 고려해 설계됐으며 `ModalStackProvider`와 함께 사용할 때 가장 안정적으로 동작합니다.

## 준비하기

```tsx
import { ModalStackProvider } from "@/ui/Modal/context";
import { Modal } from "@/ui";

function App() {
  return (
    <ModalStackProvider>
      {/* ...앱 콘텐츠 */}
    </ModalStackProvider>
  );
}
```

모달을 하나 이상 사용할 계획이라면 루트에 `ModalStackProvider`를 감싸 주세요. 중첩 모달의 포커스·ESC 처리 등이 자동으로 관리됩니다.

## 빠른 예제

```tsx
import { useRef, useState } from "react";
import { Modal } from "@/ui";

function Example() {
  const [open, setOpen] = useState(false);
  const primaryButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        모달 열기
      </button>

      <Modal
        open={open}
        onOpenChange={(nextOpen, meta) => {
          if (!nextOpen) {
            console.log("닫힘 이유:", meta.reason);
          }
          setOpen(nextOpen);
        }}
        initialFocusRef={primaryButtonRef}
        mobileBehavior="sheet"
        overlayStyle={{ backgroundColor: "rgba(17, 25, 40, 0.45)" }}
      >
        <Modal.Header>
          <h2>팀 공지</h2>
          <Modal.CloseButton aria-label="모달 닫기" />
        </Modal.Header>
        <Modal.Body>
          <p>본문 콘텐츠를 여기에 배치합니다.</p>
          <button ref={primaryButtonRef}>확인</button>
        </Modal.Body>
        <Modal.Footer>
          <button type="button" onClick={() => setOpen(false)}>
            닫기
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
```

`Modal.Header`, `Modal.Body`, `Modal.Footer`, `Modal.CloseButton`은 모두 컴포지션을 위한 서브 컴포넌트입니다. 원하는 구조로 자유롭게 배치할 수 있습니다.

## 상태 제어 & 이벤트

| prop | 설명 |
|------|------|
| `open` | 제어형 모드에서 열림 여부를 명시합니다. |
| `defaultOpen` | 비제어 모드일 때 최초 열림 상태를 지정합니다. |
| `onOpenChange(nextOpen, meta)` | 모달이 열리거나 닫힐 때 호출됩니다. `meta.reason`으로 닫힘 원인을 확인할 수 있습니다.<br/>`programmatic`, `trigger`, `close-button`, `escape`, `outside`, `submit`, `history` 값을 반환할 수 있습니다. |
| `history` | `true` 혹은 `{ enabled, url, state }` 형태로 브라우저 히스토리 연동을 제어합니다. 열릴 때 `pushState`, 뒤로가기 시 자동 닫힘이 처리됩니다. |
| `disableKeyBindings` | `true`이면 ESC·Tab 등 키 처리 로직을 비활성화합니다. |
| `onKeyDown` | 내부 콘텐츠에 추가로 키 이벤트를 전달하고 싶을 때 사용합니다. |

## 접근성 & 포커스

| prop | 설명 |
|------|------|
| `initialFocusRef` | 모달이 열릴 때 최초 포커스를 줄 요소를 지정합니다. 지정하지 않으면 콘텐츠 내 첫 번째 포커스 가능한 요소를 탐색합니다. |
| `restoreFocusRef` | 모달이 닫힌 뒤 포커스를 돌려줄 요소를 명시합니다. 기본값은 모달을 열었던 트리거입니다. |
| `ariaLabelledBy`, `ariaDescribedBy` | 모달이 참조할 라벨/설명 요소의 id를 직접 지정하고 싶을 때 사용합니다. 헤더/바디를 사용하면 자동으로 연결됩니다. |
| `trapFocus` | 기본값 `true`. Tab 이동을 모달 내부로 가두어 접근성을 보장합니다. |
| `closeOnEsc`, `closeOnOutsideClick` | ESC 키나 외부 클릭으로 닫힘을 허용할지 제어합니다. 기본값은 둘 다 `true`입니다. |

## 동작 관련 옵션

| prop | 설명 |
|------|------|
| `lockScroll` | 모달이 열려 있는 동안 문서 스크롤을 잠급니다. 기본값 `true`. |
| `hasOverlay` | 오버레이 출력 여부를 제어합니다. 기본값 `true`. |
| `overlayStyle` | 오버레이 요소에 인라인 스타일을 적용합니다. 색상·투명도·blur 등을 자유롭게 지정할 수 있습니다. |
| `zIndex`, `overlayZIndex` | 기본 레이어 값은 `LAYERS.modal(1000)`과 `LAYERS.overlay(900)`입니다. 필요한 경우 덮어써서 레이어 우선순위를 조정하세요. 콘텐츠는 자동으로 `max(zIndex, overlayZIndex) + 2` 레이어에 위치합니다. |

## 레이아웃 & 모바일

| prop | 설명 |
|------|------|
| `width`, `height`, `maxWidth`, `maxHeight`, `minWidth`, `minHeight` | 숫자를 넘기면 px로 해석하고, 문자열은 그대로 적용합니다. 기본 폭/높이 제한은 `min(90vw, 560px)` / `min(90vh, 640px)`입니다. |
| `mobileBehavior` | 작은 화면에서의 동작을 결정합니다.<br/>- `"fullscreen"`(기본): 100vw × 100vh<br/>- `"centered"`: 지정한 크기를 유지하며 가운데 정렬<br/>- `"sheet"`: 바텀시트 스타일(최대 높이는 `maxHeight` 적용)<br/>두 모드 모두 safe-area padding(`env(safe-area-inset-*)`)을 자동으로 적용합니다. |
| `style`, `className` | 모달 콘텐츠에 추가 스타일/클래스를 부여합니다. |

## 포털 & 중첩

| 항목 | 설명 |
|------|------|
| `portalElement` | 기본적으로 `document.body`에 포털링합니다. 특정 컨테이너에 렌더링하려면 DOM 노드를 넘겨 주세요. |
| `ModalStackProvider` | 중첩 모달 사용 시 반드시 루트에 감싸 주세요. 포커스·ESC·외부 클릭 처리 및 포털 inert 처리가 안전하게 동작합니다. |
| `overlayStyle` | 오버레이를 직접 스타일링할 때 사용합니다. 예: `overlayStyle={{ backdropFilter: "blur(6px)" }}` |

## 명령형 핸들

모달에 ref를 연결하면 다음 메서드를 제공합니다.

```ts
import type { ModalImperativeHandle } from "@/ui";

const ref = useRef<ModalImperativeHandle>(null);

ref.current?.open();
ref.current?.close({ reason: "programmatic" });
ref.current?.toggle();
ref.current?.focusFirst();
```

- `open(meta?)`, `close(meta?)`, `toggle(meta?)`는 제어형·비제어 모드 모두에서 사용할 수 있고, `meta.reason`을 지정해 제어 흐름을 명확히 남길 수 있습니다.
- `focusFirst()`는 모달 내부 첫 번째 포커스 가능한 요소(닫기 버튼 제외)로 포커스를 이동합니다.

## 애니메이션 & 마운트 전략

- 기본 애니메이션은 `opacity` + `translate/scale` 조합입니다.
- `prefers-reduced-motion: reduce` 환경에서는 트랜지션이 자동으로 제거됩니다.
- 닫기 애니메이션이 끝난 뒤에만 DOM에서 언마운트하여 깜빡임을 방지합니다.

## 히스토리 연동

`history` prop을 사용하면 모달 열림 상태가 브라우저 히스토리와 연동됩니다.

```tsx
// 단순 활성화
<Modal history />

// URL, state를 지정하고 싶을 때
<Modal
  history={{ enabled: true, url: "?modal=settings", state: { from: "home" } }}
/>
```

열릴 때 `pushState`, 뒤로가기 시 자동 `close({ reason: "history" })`가 호출됩니다. 라우터 연동이나 뒤로가기 UX를 맞추고 싶을 때 활용하세요.

## 그 외

- 모달은 열릴 때 처음으로 마운트(lazy mount)되며, 닫혔다가 다시 열리면 기존 상태를 재사용하지 않습니다.
- ESC/Tab 처리, 외부 클릭 리스너는 모달이 열릴 때만 등록되고 닫히면 해제되어 메모리 누수를 방지합니다.
- 오버레이 색상 기본값은 `rgba(15, 23, 42, 0.45)`입니다. `overlayStyle`로 쉽게 덮어쓸 수 있습니다.
- 날짜/숫자 형식화나 다국어 라벨링은 모달 사용자 코드에서 처리하면 되며, 컴포넌트는 이를 제한하지 않습니다.

필요에 따라 위 옵션들을 조합해 사용하면 됩니다. 문제가 있거나 추가 기능이 필요하면 해당 섹션을 참고해 확장해 주세요.
