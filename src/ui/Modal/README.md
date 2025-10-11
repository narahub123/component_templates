# Modal 컴포넌트 가이드

모달 컴포넌트는 접근성과 제어 가능성을 중심으로 설계되었습니다. 기본적으로 열림 상태를 부모에서 제어하도록 구성되어 있으며, 필요에 따라 비제어 모드, 명령형 API, 히스토리 연동 등을 선택적으로 사용할 수 있습니다.

## 빠르게 살펴보기

```tsx
import { useState, useRef } from "react";
import { Modal } from "@/ui";

function Example() {
  const [open, setOpen] = useState(false);
  const initialFocusRef = useRef<HTMLButtonElement>(null);

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
        initialFocusRef={initialFocusRef}
        history={{ enabled: true, url: "?modal=example" }}
      >
        <Modal.Header>
          <h2>제목</h2>
          <Modal.CloseButton />
        </Modal.Header>
        <Modal.Body>
          <p>본문 영역입니다.</p>
          <button ref={initialFocusRef}>확인</button>
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

- **제어형(권장)**: `open` + `onOpenChange` 조합을 사용하여 부모 컴포넌트가 상태를 관리합니다.
- **비제어형**: `defaultOpen`을 전달하면 내부 상태가 초기화되며, 이후 명시적으로 상태를 바꾸지 않는 한 내부에서 열림 상태를 관리합니다.

```tsx
<Modal open={open} onOpenChange={setOpen} />
<Modal defaultOpen />
```

## `onOpenChange`와 닫힘 이유

모달은 열림/닫힘이 변할 때 `onOpenChange(nextOpen, meta)`를 호출합니다. `meta.reason`을 통해 어떤 경로로 상태가 바뀌었는지 구분할 수 있습니다.

| reason 값        | 설명                              |
|------------------|-----------------------------------|
| `programmatic`   | 코드에서 명시적으로 open/close 호출 |
| `trigger`        | 트리거 요소 등 사용자 액션으로 열림 |
| `close-button`   | `Modal.CloseButton`으로 닫힘        |
| `escape`         | Esc 키 입력                        |
| `outside`        | 모달 외부 클릭                     |
| `submit`         | 폼 제출 등 사용처 정의             |
| `history`        | 브라우저 뒤로가기(popstate)        |

`meta.nativeEvent`에는 가능하다면 원본 이벤트가 함께 전달됩니다.

## 크기 커스터마이징

- `width`, `height`, `maxWidth`, `maxHeight`, `minWidth`, `minHeight` props를 사용하면 픽셀·퍼센트·vw/vh 등 원하는 단위로 크기를 지정할 수 있습니다.
- 숫자를 전달하면 px 단위로 자동 변환되며, 문자열을 전달하면 그대로 적용됩니다.
- 내부적으로 CSS 커스텀 프로퍼티(`--modal-width` 등)를 사용하므로, 필요하다면 `style` prop으로 직접 재정의할 수도 있습니다.

```tsx
<Modal
  open={open}
  onOpenChange={setOpen}
  width={720}
  maxHeight="80vh"
  minWidth="320px"
>
  ...
</Modal>
```

## 명령형 API

모달은 `ref`를 통해 명령형 제어를 제공합니다.

```tsx
const modalRef = useRef<ModalImperativeHandle>(null);

modalRef.current?.open();
modalRef.current?.close({ reason: "programmatic" });
modalRef.current?.toggle();
modalRef.current?.focusFirst();
```

`focusFirst()`는 모달 내부의 초점 가능한 첫 요소(닫기 버튼 제외)를 찾아 포커스를 부여합니다.

## 히스토리 연동

`history` 옵션을 사용하면 모달이 열릴 때 `history.pushState`가 수행되고, 브라우저 뒤로가기 시 모달이 닫히며 `reason: "history"`를 전달합니다.

```tsx
<Modal history />

<Modal history={{ enabled: true, url: "?modal=settings", state: { from: "home" } }} />
```

- `history`에 `true`를 주면 기본 동작만 활성화합니다.
- `state`는 pushState로 저장할 추가 데이터를, `url`은 주소 표시줄을 갱신할 경로를 지정합니다.
- 여러 모달을 중첩하거나 라우터와 결합할 때는 popstate 이벤트를 중복 처리하지 않도록 조심하세요.

## 접근성 및 포커스

- `initialFocusRef`로 처음 포커스할 요소를 지정할 수 있습니다.
- `trapFocus`(기본값 `true`)는 Tab 이동을 모달 안으로 한정합니다.
- `restoreFocusRef`를 전달하면 모달이 닫힐 때 해당 요소로 포커스를 돌려줍니다.
- `closeOnEsc`, `closeOnOutsideClick`, `lockScroll` 등 다양한 UX 세부 조정 옵션을 지원합니다.

## 공개 타입

`src/ui` 진입점에서 다음 타입을 사용할 수 있습니다.

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
} from "@/ui";
```

필요에 따라 제네릭 컨트롤러, 히스토리 헬퍼 등을 구축할 때 재사용하세요.
