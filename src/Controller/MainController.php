<?php

namespace App\Controller;

use App\Entity\Pomodoro;
use App\Entity\Task;
use App\Entity\User;
use App\Repository\PomodoroRepository;
use App\Repository\SettingsRepository;
use App\Utils\PomSettings;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class MainController extends AbstractController
{
    private $settingsRepo;
    private $pomodoroRepo;
    private $em;

    public function __construct(EntityManagerInterface $entityManager,
        SettingsRepository $settingsRepo, PomodoroRepository $pomodoroRepo)
    {
        $this->em = $entityManager;
        $this->settingsRepo = $settingsRepo;
        $this->pomodoroRepo = $pomodoroRepo;
    }

    /**
     * @Route("/", name="main")
     * @return Response
     */
    public function index(): Response
    {
        $pomSettings = $this->getPomSettings();

        //Finding current pomodoro
        $arrPom = $this->getPomodoros();

        /** @var Pomodoro $pom */
        $pom = array_pop($arrPom); //Get the last Pom
        $currPom = $pom ? $pom->getData() : null;

        return $this->render(
            'main/homepage.twig', [
            'pomCycle' => $pomSettings->getPomCycle(),
            'pom' => $pomSettings->getPom(),
            'sb' => $pomSettings->getSb(),
            'lb' => $pomSettings->getLb(),
            'slugsByDefault' => json_encode($pomSettings->getSlugsByDefault()),
            'currPom' => $currPom
        ]);
    }

    /**
     * @Route("/pomodoro/create", name="pom_create", options={"expose"=true})
     * @param Request $request
     * @return Response
     */
    public function createPomodoro(Request $request): Response
    {

        if($request->request->has('pomType') &&
            !empty($request->request->get('pomType')) &&
            $request->request->has('pomLength') &&
            !empty($request->request->get('pomLength')))
        {
            $pomType = $request->request->get('pomType');
            $pomLength = $request->request->get('pomLength');

            $pom = new Pomodoro();
            $pom->setType($pomType);
            $pom->setLength($pomLength);

            if($request->request->has('pomRound') &&
                !empty($request->request->get('pomRound')))
            {
                $pomRound = $request->request->get('pomRound');
                $pom->setPomRound($pomRound);
            }

            if($request->request->has('idTask') &&
                !empty($request->request->get('idTask')))
            {
                $idTask = $request->request->get('idTask');
                /** @var Task $task */
                $task = $this->getDoctrine()->getRepository(Task::class)->find($idTask);
                $pom->setTask($task);
            }

            if($this->getUser())
            {
                /** @var User $user */
                $user = $this->getUser();
                $pom->setUser($user);
            }

            $this->em->persist($pom);
            $this->em->flush();
            $this->em->refresh($pom);

            return new Response(json_encode($pom->getData()), Response::HTTP_OK, ['content-type' => 'application/json']);
        }

        return new Response(json_encode([]), Response::HTTP_BAD_REQUEST, ['content-type' => 'application/json']);
    }

    /**
     * @Route("/pomodoro/{id}/edit", name="pom_edit", options={"expose"=true})
     * @param Pomodoro $pom
     * @param Request $request
     * @return Response
     */
    public function editPomodoro(Pomodoro $pom, Request $request): Response
    {
        $onEdit = false;
        if($request->request->has('pausedAt'))
        {
            $onEdit = true;
            $pausedAt = $request->request->get('pausedAt');
            $pom->setPausedAt($pausedAt === '' ? null : new \DateTime($pausedAt));
        }

        if($request->request->has('modifiedAt') && !empty($request->request->get('modifiedAt')))
        {
            $onEdit = true;
            $modifiedAt = $request->request->get('modifiedAt');
            $pom->setModifiedAt(new \DateTime($modifiedAt));
        }

        if($request->request->has('finishedAt') && !empty($request->request->get('finishedAt')))
        {
            $onEdit = true;
            $finishedAt = $request->request->get('finishedAt');
            $pom->setFinishedAt(new \DateTime($finishedAt));
        }

        if($request->request->has('secRemaining'))
        {
            $onEdit = true;
            $secRemaining = $request->request->get('secRemaining');
            $pom->setSecRemaining($secRemaining === '' ? null : $secRemaining);
        }

        if($request->request->has('pomRound') && !empty($request->request->get('pomRound')))
        {
            $onEdit = true;
            $pomRound = $request->request->get('pomRound');
            $pom->setPomRound($pomRound);
        }

        if($request->request->has('pomCompleted'))
        {
            $onEdit = true;
            $pomCompleted = $request->request->get('pomCompleted');
            $pom->setCompleted($pomCompleted === 'true' ?? false);
        }

        if($onEdit){
            $this->em->flush();
            $this->em->refresh($pom);

            return new Response(json_encode($pom->getData()), Response::HTTP_OK, ['content-type' => 'application/json']);
        }

        return new Response(json_encode([]), Response::HTTP_BAD_REQUEST, ['content-type' => 'application/json']);
    }

    /**
     * @Route("/pomodoro/history", name="history_pom")
     * @return Response
     */
    public function historyPoms(): Response
    {
        $arrPom = $this->getPomodoros();

        return $this->render('main/history.html.twig', [
            'pomodoros' => $arrPom
        ]);
    }

    /** Function that get all pomodoros by user */
    public function getPomodoros()
    {
        //Get User Logged
        $userId = $this->getUser() ? $this->getUser()->getId() : null;

        return $this->pomodoroRepo->findAllPomodorosByUser($userId);
    }

    /**
     * @return PomSettings
     */
    public function getPomSettings(): PomSettings
    {
        $pomSettings = new PomSettings();
        $settings = $this->settingsRepo->findAllBySlugs($pomSettings->getSlugsByDefault());

        $pomSettings->populate($settings);

        return $pomSettings;
    }
}
