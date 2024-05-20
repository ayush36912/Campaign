import React, { useState } from 'react';
import { Transition } from 'react-transition-group';

const TransitionComp = ({ children }) => {
  const [show, setShow] = useState(true);

  const handleExited = () => {
    console.log(children + " has been removed");
    setShow(false);
  };

  return (
    <Transition in={show} timeout={{
      exit:500
    }} onEnter={handleExited}>
      {state => (
        <div className={`trs trs-${state}`}>
         { console.log(state)} 
          {children}
        </div>
      )}
    </Transition>
  );
};

export default TransitionComp;
