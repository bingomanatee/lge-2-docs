import React from 'react';
import styled from 'styled-components';

import {headerFonts} from './constants';

const List = styled.div`
  @media screen and (min-width: 900px){
    display: grid;
    grid-gap: 1rem 1rem;
    align-items: start;
    grid-template-columns: ${({children}) => {
    let count = Math.max(React.Children.count(children), 1);
    let items = [];
    items.length = count;
    const percent = 100 / count;
    while (count > 0) {
      items.push(`${percent.toFixed(2)}%`);
      count -= 1;
    }
    return items.join(' ');
  }};
}
`;
List.Item = styled.div`
padding: 1rem;
`;
List.ItemHead = styled.h3`
text-transform: uppercase;
  @media screen and (min-width: 900px){
text-align: center;
}
 `;

export default List;
