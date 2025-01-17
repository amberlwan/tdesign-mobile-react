import React, { useEffect, useState, useCallback, useRef } from 'react';
import classNames from 'classnames';
import { CSSTransition } from 'react-transition-group';
import { Icon } from 'tdesign-icons-react';
import useConfig from '../_util/useConfig';
import { TdMessageProps } from './type';
import useMessageCssTransition from './hooks/useMessageCssTransition';
import { IconType, MessageThemeListEnum } from './constant';
import noop from '../_util/noop';

interface MessageProps extends TdMessageProps {
  children?: React.ReactNode;
  el: React.ReactNode;
}

const Message: React.FC<TdMessageProps> = (props: MessageProps) => {
  const {
    children,
    closeBtn = false,
    duration = 3000,
    theme = MessageThemeListEnum.info,
    visible = undefined,
    zIndex = 5000,
    onOpen = noop, // 展示Message时触发
    onOpened = noop, // 展示Message时并且动画结束后触发
    onClose = noop, // 关闭Message时触发
    onClosed = noop, // 关闭Message时并且动画结束后触发
    onVisibleChange = noop, // 可见性变化时触发
    content = '',
    icon = false,
    el,
  } = props;

  const { classPrefix } = useConfig();

  const [messageVisible, setMessageVisible] = useState<boolean>(false);
  const [isControl, setIsControl] = useState<boolean>(false);

  const contentRef = useRef<HTMLDivElement>(null);

  const cssTransitionState = useMessageCssTransition({
    contentRef,
    classPrefix: 'message',
    onEnter: onOpen,
    onEntered: onOpened,
    onExit: onClose,
    onExited: onClosed,
    el,
  });

  useEffect(() => {
    const isControlled = duration === 0 && typeof visible === 'boolean' && closeBtn !== true;
    setIsControl(isControlled);
    if (!isControlled) {
      setMessageVisible(true);
    }
  }, [visible, duration, closeBtn]);

  const handleClick = useCallback(() => {
    setMessageVisible(false);
  }, []);

  useEffect(() => {
    let timer = null;
    if (duration) {
      timer = setTimeout(() => {
        setMessageVisible(false);
      }, duration);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [duration]);

  useEffect(() => {
    onVisibleChange(isControl ? visible : messageVisible);
  }, [onVisibleChange, isControl, visible, messageVisible]);

  const leftIcon = typeof icon === 'boolean' ? <>{icon && <Icon name={IconType[theme]} size={22} />}</> : icon;

  const closeButton = closeBtn === true ? <Icon name="close" size={22} onClick={handleClick} /> : closeBtn;

  const mainContent = content ? content : children;

  return (
    <CSSTransition in={isControl ? visible : messageVisible} appear {...cssTransitionState.props} unmountOnExit>
      <div
        className={classNames(
          `${classPrefix}-message`,
          `${classPrefix}-message-align--center`,
          `${classPrefix}-message--${theme}`,
        )}
        ref={contentRef}
        style={{ zIndex }}
      >
        {leftIcon}
        <div className={`${classPrefix}-message--txt`}>{mainContent}</div>
        {closeButton}
      </div>
    </CSSTransition>
  );
};

export default Message;
