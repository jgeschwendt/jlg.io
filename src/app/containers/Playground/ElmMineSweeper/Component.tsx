import React from 'react';

export const Component = (props: any) => {

  const handleOnClick = (e: React.MouseEvent) => {
    console.log(props);
    console.log(e);
  };

  return (
    <div>
      <button
        onClick={handleOnClick}
      >[]</button>
    </div>
  );
};
