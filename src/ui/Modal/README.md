# Modal 컴포넌트 가이드

모달 컴포넌트는 접근성과 제어 가능성을 중심으로 설계되었습니다. 기본적으로 제어형 사용을 권장하지만, 필요에 따라 비제어 모드, 명령형 API, 히스토리 연동, 모바일 전환 옵션 등을 활성화할 수 있습니다.

## 빠르게 살펴보기

```tsx
import { useRef, useState } from "react";
import { Modal } from "@/ui";

function Example() {
  const [open, setOpen] = useState(false);
  const primaryActionRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        열기
      </button>

      <Modal
        open={open}
        onOpenChange={(nextOpen, meta) => {
          if (!nextOpen) {
            console.log("닫힘 이유:", meta.reason);
          }
          setOpen(nextOpen);
        }}
        initialFocusRef={primaryActionRef}
        history={{ enabled: true, url: "?modal=example" }}
      >
        <Modal.Header>
          <h2>팀 알림</h2>
          <Modal.CloseButton />
        </Modal.Header>
        <Modal.Body>
          <p>본문 내용을 배치합니다.</p>
          <button ref={primaryActionRef}>확인</button>
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

## 제어 / 비제어 사용

- **제어형(권장)**: `open` + `onOpenChange`. 부모 컴포넌트가 상태를 관리합니다.
- **비제어형**: `defaultOpen`만 전달하면 내부 상태로 열림 여부를 관리합니다.

```tsx
<Modal open={open} onOpenChange={setOpen} />
<Modal defaultOpen />
```

## `onOpenChange`와 닫힘 이유

`onOpenChange(nextOpen, meta)` 호출 시 `meta.reason`을 통해 상태 전환 경로를 확인할 수 있습니다.

| reason 값      | 설명                                           |
|----------------|------------------------------------------------|
| `programmatic` | 코드에서 직접 `open/close` 호출                |
| `trigger`      | 트리거 요소 등 사용자 액션으로 열린 경우       |
| `close-button` | `Modal.CloseButton` 클릭                        |
| `escape`       | ESC 키 입력                                    |
| `outside`      | 모달 밖을 클릭                                 |
| `submit`       | 폼 제출 등 사용처에서 정의한 닫힘              |
| `history`      | 브라우저 뒤로가기(popstate)                    |

`meta.nativeEvent`에는 가능하면 원본 이벤트가 함께 전달됩니다.

## 크기 커스터마이징

- `width`, `height`, `maxWidth`, `maxHeight`, `minWidth`, `minHeight` props로 px·%·vw/vh 단위를 자유롭게 지정할 수 있습니다.
- 숫자를 전달하면 px 단위로 자동 변환되고, 문자열은 그대로 적용됩니다.
- 내부적으로 CSS 커스텀 프로퍼티(`--modal-width` 등)를 사용하므로 `style` prop으로 직접 재정의할 수도 있습니다.
- 모바일 브레이크포인트(가로 500px 이하)에서는 기본적으로 풀스크린으로 전환되며, 이때는 지정한 `minWidth`/`minHeight`보다 뷰포트 크기가 우선합니다.

```tsx
<Modal
  open={open}
  onOpenChange={setOpen}
  width={720}
  maxHeight="80vh"
  minWidth="320px"
/>
```

## 모바일 전환 옵션

`mobileBehavior` prop으로 작은 화면에서의 레이아웃을 제어합니다. 기본값은 `"fullscreen"`입니다.

| 값            | 설명                                                         |
|---------------|--------------------------------------------------------------|
| `"fullscreen"`| 500px 이하에서 폭/높이를 100vw/100vh로 확장                  |
| `"centered"`  | 모바일에서도 가운데 정렬 유지, 지정한 크기 범위 내에서 표시 |
| `"sheet"`     | 바텀시트 형태로 전환, 최대 높이는 `maxHeight`로 제한         |

- `"centered"`를 선택한 경우에만 `width`/`maxWidth`/`minWidth` 등이 모바일에서도 그대로 적용됩니다. `"fullscreen"`과 `"sheet"`는 폭을 100vw로 강제하기 때문에 높이 관련 옵션(`maxHeight`, `minHeight`)만 영향을 줍니다.
- `"fullscreen"`과 `"sheet"` 변형에서는 safe-area padding(`env(safe-area-inset-*)`)이 자동 적용되어 노치/라운드 엣지가 있는 기기에서도 콘텐츠가 잘리지 않습니다. `"centered"` 역시 좌·우 safe-area를 고려한 기본 여백이 포함됩니다.

```tsx
<Modal
  open={open}
  onOpenChange={setOpen}
  mobileBehavior="sheet"
  maxHeight="75vh"
/>
```

## 레이어 우선순위

- 기본 레이어 값은 `overlay: 900`, `modal: 1000`이며 `LAYERS` 상수로 재사용할 수 있습니다.
- 포털 컨테이너는 `zIndex`를 그대로 사용하고, 오버레이는 `overlayZIndex`, 실제 모달 콘텐츠는 `max(zIndex, overlayZIndex) + 2`로 자동 계산되어 항상 오버레이 위에 렌더링됩니다.
- `zIndex`와 `overlayZIndex` props를 사용하면 화면별로 우선순위를 덮어쓸 수 있습니다.

```tsx
import { LAYERS, Modal } from "@/ui";

<Modal
  open={open}
  onOpenChange={setOpen}
  zIndex={LAYERS.modal + 100}
  overlayZIndex={LAYERS.overlay + 50}
/>
```

## 명령형 API

`ref`를 통해 명령형 제어를 사용할 수 있습니다.

```tsx
const modalRef = useRef<ModalImperativeHandle>(null);

modalRef.current?.open();
modalRef.current?.close({ reason: "programmatic" });
modalRef.current?.toggle();
modalRef.current?.focusFirst();
```

`focusFirst()`는 모달 내부에서 초점 가능한 첫 요소(닫기 버튼 제외)를 찾아 포커스를 이동시킵니다.

## 히스토리 연동

`history` 옵션을 사용하면 모달이 열릴 때 `history.pushState`가 호출되고, 뒤로가기 시 `reason: "history"`로 모달이 닫힙니다.

```tsx
<Modal history />

<Modal
  history={{ enabled: true, url: "?modal=settings", state: { from: "home" } }}
/>
```

- `history`에 `true`를 전달하면 기본 동작만 활성화합니다.
- `state`는 pushState로 저장할 추가 데이터를, `url`은 주소 표시줄을 갱신할 경로를 지정합니다.
- 다중 모달이나 라우터와 결합할 때는 popstate 중복 처리에 주의하세요.

## 포커스 & 접근성

- `initialFocusRef`: 모달이 열릴 때 포커스를 줄 요소.
- `trapFocus`(기본값 `true`): Tab 이동을 모달 내부로 한정합니다.
- `restoreFocusRef`: 모달이 닫힐 때 포커스를 되돌릴 요소.
- `closeOnEsc`, `closeOnOutsideClick`, `lockScroll` 등 세부 UX 옵션을 제공합니다.

## 공개 타입

```ts
import type {
  ModalProps,
  ModalImperativeHandle,
  ModalOpenChangeHandler,
  ModalOpenChangeMeta,
  ModalOpenChangeMetaInput,
  ModalOpenChangeReason,
  ModalHistoryOptions,
  ResolvedModalHistoryOptions,
  ModalMobileBehavior,
} from "@/ui";
```

필요에 따라 커스텀 컨트롤러나 히스토리 연동 레이어를 구축할 때 재사용하세요.
