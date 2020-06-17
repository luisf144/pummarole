<?php

namespace App\Controller;

use App\Entity\Task;
use App\Entity\User;
use App\Form\TaskFormType;
use App\Repository\TaskRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class TaskController extends AbstractController
{

    private $em;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->em = $entityManager;
    }

    /**
     * @Route("task/list", name="task_list")
     * @param TaskRepository $taskRepo
     * @return Response
     */
    public function listTask(TaskRepository $taskRepo): Response
    {
        //Get User Logged
        $userId = $this->getUser() ? $this->getUser()->getId() : null;

        $tasks = $taskRepo->findAllByUser($userId);

        return $this->render('task/list.html.twig', [
            'tasks' => $tasks
        ]);
    }

    /**
     * @Route("/task/create", name="task_create")
     * @param Request $request
     * @return Response
     */
    public function createTask(Request $request): Response
    {
        $form = $this->createForm(TaskFormType::class);
        $form->handleRequest($request);

        if($form->isSubmitted() && $form->isValid()){
            /** @var Task $task */
            $task = $form->getData();

            if($this->getUser()){
                /** @var User $user */
                $user = $this->getUser(); //Get User logged
                $task->setUser($user);
            }

            $this->em->persist($task);
            $this->em->flush();

            $this->addFlash('success', 'Task created successfully!');

            return $this->redirectToRoute('main');
        }

        return $this->render('task/create.html.twig', [
            'taskForm' => $form->createView()
        ]);
    }

    /**
     * @Route("/task/{id}/delete", name="task_delete", options={"expose"=true})
     * @param Task $task
     * @return Response
     */
    public function deleteTask(Task $task): Response
    {
        if($task){
            $this->em->remove($task);
            $this->em->flush();

            return new Response(json_encode([]), Response::HTTP_OK, ['content-type' => 'application/json']);
        }

        return new Response(json_encode([]), Response::HTTP_BAD_REQUEST, ['content-type' => 'application/json']);
    }
}