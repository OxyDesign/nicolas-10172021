import { ReactNode } from 'react';

type ButtonProps = {
  onClick: Function;
  children: ReactNode;
};

function Button({ children, onClick = () => {} }: ButtonProps) {
  return (<button className="primary-button" onClick={ () => {
    onClick();
  } }>
    { children }
  </button>);
}

export default Button;
