'use strict';

const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');
const btnCloseModal = document.querySelector(".close-modal");
const btnsOpenModal = document.querySelectorAll(".show-modal");

console.log(btnsOpenModal);

function openModal ()
{
  console.log('button clicked');
  modal.classList.remove('hidden');
  overlay.classList.remove('hidden');
}

function closeModal ()
{
  modal.classList.add('hidden');
  overlay.classList.add('hidden');
}

for (let btnOpenModal of btnsOpenModal)
  btnOpenModal.addEventListener('click', openModal);

btnCloseModal.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

document.addEventListener('keydown', (event) =>
{
  if (event.key === 'Escape' && !modal.classList.contains('.hidden'))
    closeModal();
});