function setupImageEventListeners(triggerElement, targetImage) {
  triggerElement.addEventListener('mouseout', () => {
      targetImage.style.opacity = '0';
  });

  triggerElement.addEventListener('mouseover', () => {
      targetImage.style.opacity = '1';
  });
}

const yellowEngLink = document.querySelector('.yellow-eng');
const geeseImage = document.querySelector('.geese-image');
const geeseImage2 = document.querySelector('.geese-image2')

setupImageEventListeners(yellowEngLink, geeseImage);
setupImageEventListeners(yellowEngLink, geeseImage2);

