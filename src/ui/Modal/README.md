# Modal 컴포넌트 가이드

이 문서는 모달 컴포넌트의 주요 API와 사용 방법을 정리합니다. 기본적으로 제어형(open/onOpenChange) 사용을 권장하지만, 비제어 모드, 명령형 핸들, 히스토리 연동, 모바일 전환 옵션, 오버레이 스타일 커스터마이징 등 다양한 기능을 제공하도록 설계되어 있습니다.

## 빠르게 살펴보기

`	sx
import { useRef, useState } from "react";
import { Modal } from "@/ui";

function Example() {
  const [open, setOpen] = useState(false);
  const primaryActionRef = useRef<HTMLButtonElement>(null);

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
        initialFocusRef={primaryActionRef}
        history={{ enabled: true, url: "?modal=example" }}
      >
        <Modal.Header>
          <h2>팀 공지</h2>
          <Modal.CloseButton />
        </Modal.Header>
        <Modal.Body>
          <p>본문 내용을 여기에 배치합니다.</p>
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
`

## 제어 / 비제어 사용

- **제어형(권장)**: open + onOpenChange 조합으로 부모가 상태를 관리합니다.
- **비제어형**: defaultOpen만 전달하면 내부 상태로 열림 여부를 관리합니다.

`	sx
<Modal open={open} onOpenChange={setOpen} />
<Modal defaultOpen />
`

## onOpenChange와 닫힘 이유

onOpenChange(nextOpen, meta) 호출 시 meta.reason 값으로 상태가 변경된 원인을 확인할 수 있습니다.

| reason 값      | 설명                                           |
|----------------|------------------------------------------------|
| programmatic | 코드에서 직접 open/close 호출                |
| 	rigger      | 트리거 요소 등 사용자 액션으로 열린 경우       |
| close-button | Modal.CloseButton 클릭                        |
| escape       | ESC 키 입력                                    |
| outside      | 모달 밖을 클릭                                 |
| submit       | 폼 제출 등 사용처에서 정의한 닫힘              |
| history      | 브라우저 뒤로가기(popstate)                    |

meta.nativeEvent에는 가능하다면 원본 DOM 이벤트가 함께 전달됩니다.

## 크기 커스터마이징

- width, height, maxWidth, maxHeight, minWidth, minHeight props로 px·%·vw/vh 단위의 크기를 지정할 수 있습니다.
- 숫자는 px 단위로 자동 변환되며, 문자열은 그대로 적용됩니다.
- 내부적으로 CSS 커스텀 프로퍼티를 사용하므로 style prop으로 직접 재정의할 수도 있습니다.
- 뷰포트 너비가 500px 이하인 경우 기본적으로 풀스크린으로 전환되어 minWidth/minHeight보다 뷰포트 크기가 우선됩니다.

`	sx
<Modal
  open={open}
  onOpenChange={setOpen}
  width={720}
  maxHeight="80vh"
  minWidth="320px"
/>
`

## 모바일 전환 옵션

mobileBehavior prop으로 작은 화면에서의 레이아웃을 제어합니다. 기본값은 "fullscreen"입니다.

| 값            | 설명                                                         |
|---------------|--------------------------------------------------------------|
| "fullscreen"| 500px 이하에서 폭·높이를 100vw × 100vh로 확장               |
| "centered"  | 모바일에서도 가운데 정렬 유지, 지정한 폭 범위 내에서 표시  |
| "sheet"     | 바텀시트 형태로 전환, 최대 높이는 maxHeight로 제한        |

- "centered"는 모바일에서도 width 관련 props를 그대로 따르고, "fullscreen"/"sheet"는 폭을 100vw로 강제하기 때문에 높이 관련 옵션(maxHeight, minHeight)만 영향을 줍니다.
- "fullscreen"과 "sheet"에서는 safe-area padding(env(safe-area-inset-*))이 자동 적용되고, "centered" 역시 좌우 safe-area를 고려한 기본 여백이 포함됩니다.

`	sx
<Modal
  open={open}
  onOpenChange={setOpen}
  mobileBehavior="sheet"
  maxHeight="75vh"
/>
`

## 레이어 우선순위 및 오버레이 스타일

- 기본 레이어 값은 overlay: 900, modal: 1000이며 LAYERS 상수로 재사용할 수 있습니다.
- 포털 컨테이너는 zIndex, 오버레이는 overlayZIndex, 모달 콘텐츠는 max(zIndex, overlayZIndex) + 2로 자동 계산되어 항상 오버레이 위에 표시됩니다.
- zIndex와 overlayZIndex props로 화면별 레이어 우선순위를 조정할 수 있고, overlayStyle prop을 사용하면 오버레이 색상·투명도·blur 등을 인라인 스타일로 덮어쓸 수 있습니다.

`	sx
import { LAYERS, Modal } from "@/ui";

<Modal
  open={open}
  onOpenChange={setOpen}
  overlayStyle={{ backgroundColor: "rgba(17, 25, 40, 0.6)" }}
  zIndex={LAYERS.modal + 100}
  overlayZIndex={LAYERS.overlay + 50}
/>
`

## 명령형 API

ef를 통해 명령형으로 제어할 수 있습니다.

`	sx
const modalRef = useRef<ModalImperativeHandle>(null);

modalRef.current?.open();
modalRef.current?.close({ reason: "programmatic" });
modalRef.current?.toggle();
modalRef.current?.focusFirst();
`

ocusFirst()는 모달 내부에서 초점 가능한 첫 요소(닫기 버튼 제외)를 찾아 포커스를 이동시킵니다.

## 히스토리 연동

history 옵션을 사용하면 모달이 열릴 때 history.pushState가 호출되고, 브라우저 뒤로가기로 닫히면서 eason: "history"가 전달됩니다.

`	sx
<Modal history />

<Modal
  history={{ enabled: true, url: "?modal=settings", state: { from: "home" } }}
/>
`

## 포커스 & 접근성 보조 기능

- initialFocusRef: 모달이 열릴 때 포커스를 줄 요소
- 	rapFocus(기본값 	rue): Tab 이동을 모달 내부로 한정
- estoreFocusRef: 모달이 닫힐 때 포커스를 복원할 요소
- closeOnEsc, closeOnOutsideClick, lockScroll 등 다양한 UX 옵션 제공

## 공개 타입

`	s
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
`

상위 래퍼 컴포넌트나 히스토리 브리지 등을 구현할 때 위 타입들을 활용하세요.
