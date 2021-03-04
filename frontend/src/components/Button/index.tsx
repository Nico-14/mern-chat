import styles from './Button.module.css';

interface ButtonProps {
  children?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const Button = ({ children, onClick, disabled, type }: ButtonProps) => {
  return (
    <button className={styles.button} onClick={onClick} disabled={disabled} type={type}>
      {children}
    </button>
  );
};

export default Button;
